#!/usr/bin/env bash
#
# h6b-backup.sh — H-6b: dựng bản sao lưu thứ hai của 9Chain-A1 và NGHIỆM THU nó.
#
#   bash scripts/h6b-backup.sh              # dựng + nghiệm thu + đẩy lên máy chủ
#   bash scripts/h6b-backup.sh --khong-day  # dựng + nghiệm thu, KHÔNG chạm máy chủ
#   bash scripts/h6b-backup.sh --check       # CHỈ hỏi "bản mới nhất còn tươi không" (A-014)
#   bash scripts/h6b-backup.sh --self-test    # chứng minh cổng này biết báo ĐỎ
#
# ═══ VÌ SAO PHẢI LÀ SCRIPT, KHÔNG PHẢI QUY TRÌNH TRONG TÀI LIỆU ═══
# H-6b từng là 8 bước viết tay trong `BLOCKERS.md`. Nó đã chạy ba lần và **hai lần
# đầu để lại một bản sao lưu cũ**: bản `25/08` thiếu cả lớp chủ quyền, bản `27/08`
# cũ 12 patch / 45 commit chỉ sau MỘT ngày. Không lần nào có dấu hiệu gì — bản sao
# lưu vẫn nghiệm thu xanh, vì nó **lành**; nó chỉ **cũ**. Một quy trình 8 bước là
# một quy trình sẽ bị làm tắt lúc vội, và bước bị bỏ luôn là bước nghiệm thu.
# ⇒ Bốn phép nghiệm thu nằm TRONG script này, không nằm cạnh nó.
#
# ═══ BA CÁI BẪY ĐÃ DÍNH — ĐỌC TRƯỚC KHI SỬA ═══
#
# 1. 🔴 `git bundle` CHO FORK SINH RA BACKUP GIẢ.
#    `upstream/avalanchego` là **shallow clone** (ranh giới `1cf1fc3`). Bundle từ
#    repo shallow luôn hỏng, nhưng `git bundle verify` vẫn in *"is okay"* và
#    *"records a complete history"* — clone ngược mới chết:
#    `remote did not send all necessary objects`.
#    ⇒ Lớp chủ quyền đi bằng **patch series**, không bằng bundle.
#    ⇒ `git bundle verify` KHÔNG ĐỦ ĐỂ TIN. Phép đo đúng là **CLONE NGƯỢC**.
#
# 2. 🔴 SO **TREE HASH**, KHÔNG SO COMMIT HASH.
#    `git am` ghi lại committer nên commit hash đổi mỗi lần áp, trong khi cây mã
#    nguồn vẫn đúng từng byte. So commit hash sẽ báo đỏ giả vĩnh viễn.
#
# 3. 🔴 MỘT CỔNG CHỈ TỪNG XANH KHÔNG CHỨNG MINH GÌ.
#    Phép nghiệm thu phải **phân biệt được** bản lành với bản hỏng. Vì thế script
#    tự cắt cụt một bản bundle và ĐÒI nó bị từ chối. Bỏ bước đó đi là quay lại
#    đúng lớp lỗi mà cả dự án này đã trả giá nhiều lần.
#
# ═══ THỨ SCRIPT NÀY KHÔNG CỨU ═══
# 🔴 KHÔNG có khoá 5 quỹ. `local-net/net-*/keys.txt` bị `.gitignore` — CỐ Ý.
# Mất máy dev vẫn = mất khoá cả 5 quỹ. Đó là D-044 / O1, một việc KHÁC, và chạy
# script này xong KHÔNG có nghĩa là đã an toàn.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FORK="$ROOT/upstream/avalanchego"
PATCHES="$ROOT/patches"
KHO="${A1_BACKUP_ROOT:-/c/PROJECTS/9Chain-backups}"
# 🔴 Trước 28/08 tệp này đọc `A1_BACKUP_HOST`/`A1_BACKUP_KEY` — hai tên KHÔNG script nào
# khác dùng. Dời máy chủ mà quên chúng thì bản sao lưu lặng lẽ chụp MÁY CŨ, và nó vẫn in
# ra một dòng xanh. Nay dùng chung tên với mọi nơi khác.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")/../local-net/deploy" && pwd)/server-env.sh"
MAY_CHU="$A1_SSH_HOST"
KHOA_SSH="$A1_SSH_KEY"
DICH_XA="${A1_BACKUP_REMOTE_DIR:-~/9chain-a1/backup}"

DAY_LEN_SERVER=1
CHE_DO="day-du"
for a in "$@"; do
  case "$a" in
    --khong-day) DAY_LEN_SERVER=0 ;;
    --check)      CHE_DO="kiem" ;;
    --self-test)   CHE_DO="tu-kiem" ;;
    *) echo "✗ tham số lạ: $a"; exit 1 ;;
  esac
done

TAM=""
don_dep() { [ -n "$TAM" ] && rm -rf "$TAM" 2>/dev/null || true; }
trap don_dep EXIT

LOI=0
dat()   { echo "  ✓ $*"; }
truot() { echo "  ✗ $*"; LOI=$((LOI+1)); }

# ─────────────────────────────────────────────────────────────────────────────
# --check — cổng A-014: bản sao lưu mới nhất còn tả được mạng đang chạy không?
#
# 🔴 ĐỎ VÀ VÀNG LÀ HAI THỨ KHÁC NHAU, VÀ ĐÓ LÀ CẢ ĐIỂM CỦA MỤC NÀY.
# Bản đầu của điều kiện qua đòi `git rev-list <HEAD-backup>..main == 0`, tức đòi
# bản sao lưu LUÔN BẰNG `HEAD`. Điều đó bất khả thi trong một repo có hai session
# làm việc song song: đo mười phút sau lượt sao lưu là đã đỏ, kể cả khi commit
# duy nhất chỉ sửa chính tả trong `docs/`.
# Repo này đã học đúng bài đó một lần: bản đầu `check-deploy-drift.mjs` tự đoán
# phạm vi bằng glob, báo 27/58 lệch mà phần lớn là ĐỎ GIẢ, và chính nó viết ra
# *"một cổng đỏ ở chỗ không cần đỏ sẽ bị người ta học cách bỏ qua, và nó sẽ bị bỏ
# qua đúng vào lần nó đỏ thật."*
# ⇒ Đại lượng cần đo không phải "backup == HEAD" mà "backup có đủ thứ ĐỊNH NGHĨA
#   MẠNG ĐANG CHẠY". Lệch mã ⇒ ĐỎ. Lệch chỉ tài liệu ⇒ VÀNG.
# ─────────────────────────────────────────────────────────────────────────────
# Thư mục mã: đụng vào là mạng dựng lại khác đi. `docs/` không nằm ở đây — CỐ Ý.
DUONG_MA=(patches local-net upstream scripts web genesis 9chain-a1-config)

ban_moi_nhat() { ls -d "$KHO"/9chain-a1-backup-*/ 2>/dev/null | sort | tail -1; }

# Prints "HEAD PATCH FORK_TREE". FORK_TREE is `KHONG-GHI` for bundles built before 2026-08-31.
doc_manifest() {  # $1 = backup directory
  local d="$1"
  if [ -f "$d/manifest.env" ]; then
    ( . "$d/manifest.env"; echo "$HEAD $PATCH ${FORK_TREE:-KHONG-GHI}" )
  else
    # Bản cũ (25/08, 27/08) không có manifest.env — rút từ MANIFEST.txt.
    local h p
    h="$(grep -oE 'HEAD +[0-9a-f]{7,40}' "$d/MANIFEST.txt" 2>/dev/null | awk '{print $2}' | head -1)"
    p="$(ls "$d/avalanchego-patches" 2>/dev/null | wc -l)"
    echo "${h:-KHONG-DOC-DUOC} $p KHONG-GHI"
  fi
}

kiem_tuoi() {
  local d; d="$(ban_moi_nhat)"
  [ -n "$d" ] || { echo "🔴 KHÔNG CÓ BẢN SAO LƯU NÀO trong $KHO"; return 1; }
  echo "── kiểm bản mới nhất: $(basename "$d")"

  local head_bk patch_bk fork_bk patch_now fork_now
  read -r head_bk patch_bk fork_bk <<<"$(doc_manifest "$d")"
  patch_now="$(ls "$PATCHES" | wc -l)"
  fork_now="$(git -C "$FORK" rev-parse HEAD^{tree} 2>/dev/null || echo KHONG-DOC-DUOC)"

  local do_=0 vang=0

  # ═══ ĐỎ 0 — CÂY FORK. 🔴 THE `git diff` BELOW IS BLIND TO IT, MEASURED 2026-08-31. ═══
  #
  # `DUONG_MA` lists `upstream`, which reads as though the fork were covered. It is not:
  # `.gitignore` carries the line `upstream/`, so `git ls-files upstream` returns **0** and
  # `git diff -- upstream` can never report anything. Every sovereign line of code — the whole
  # reason a restore is worth having — sat outside the freshness check, with the patch COUNT as
  # its only proxy.
  #
  # A count is not content. Regenerating the set 26 -> 26 with different content leaves this
  # gate printing "still fresh" for a bundle that describes a different binary. That is B-20s
  # shape exactly (a correct patch count over empty content), one layer down.
  #
  # The number needed was already being written: `manifest.env` has recorded `FORK_TREE` since
  # the bundle format was introduced. `doc_manifest()` simply threw it away.
  #
  # Not recorded => RED, not amber: "could not compare" is not "matches" (D-069b), and the fix is
  # one command — build a fresh bundle, which does record it.
  if [ "$fork_bk" = "KHONG-GHI" ]; then
    echo "  🔴 fork tree: backup records NO FORK_TREE => the sovereign tree cannot be compared"
    do_=$((do_+1))
  elif [ "$fork_bk" != "$fork_now" ]; then
    echo "  🔴 fork tree: backup ${fork_bk:0:12} != repo ${fork_now:0:12}"
    do_=$((do_+1))
  else
    dat "fork tree: ${fork_bk:0:12} = ${fork_now:0:12}"
  fi

  # RED 1 — patch count differs. This is the sovereign layer: one missing patch rebuilds a
  # DIFFERENT network, not an older one.
  if [ "$patch_bk" != "$patch_now" ]; then
    echo "  🔴 patch: backup $patch_bk ≠ repo $patch_now"; do_=$((do_+1))
  else
    dat "patch: $patch_bk = $patch_now"
  fi

  if ! git -C "$ROOT" cat-file -e "${head_bk}^{commit}" 2>/dev/null; then
    echo "  🔴 HEAD của backup ($head_bk) không có trong repo — bản sao lưu không đối chiếu được"
    return 1
  fi

  # RED 2 — a CODE file changed between the backup's HEAD and main.
  local ma_lech
  ma_lech="$(git -C "$ROOT" diff --name-only "$head_bk..main" -- "${DUONG_MA[@]}" | wc -l)"
  if [ "$ma_lech" -gt 0 ]; then
    echo "  🔴 $ma_lech tệp MÃ đã đổi sau lượt sao lưu:"
    git -C "$ROOT" diff --name-only "$head_bk..main" -- "${DUONG_MA[@]}" | head -10 | sed 's/^/       /'
    do_=$((do_+1))
  else
    dat "không tệp mã nào đổi sau lượt sao lưu"
  fi

  # VÀNG — cũ vài commit nhưng toàn tài liệu. Nói ra, không báo đỏ.
  local n; n="$(git -C "$ROOT" rev-list --count "$head_bk..main")"
  if [ "$n" -gt 0 ] && [ "$ma_lech" -eq 0 ]; then
    echo "  🟡 backup cũ $n commit — nhưng CHỈ chạm tài liệu, mạng vẫn dựng lại được"
    vang=$((vang+1))
  fi

  echo
  if [ "$do_" -gt 0 ]; then
    echo "🔴 BẢN SAO LƯU KHÔNG CÒN TẢ ĐƯỢC MẠNG ĐANG CHẠY. Chạy lại:"
    echo "     bash scripts/h6b-backup.sh"
    return 1
  fi
  [ "$vang" -gt 0 ] && echo "🟡 đạt, có cảnh báo." || echo "✓ bản sao lưu còn tươi."
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# Bốn phép nghiệm thu — dùng chung cho lượt dựng thật và cho --self-test.
# ─────────────────────────────────────────────────────────────────────────────
# 🔴 CÁC HÀM nt_* KHÔNG BAO GIỜ TRẢ MÃ KHÁC 0 — chúng chỉ GHI NHẬN vào $LOI.
# Lý do: script chạy `set -e`, nên một hàm nghiệm thu trả 1 sẽ giết cả script
# NGAY TẠI CA ĐANG CỐ Ý LÀM HỎNG của `--self-test`. Tức là ca "phải đỏ" sẽ không
# bao giờ chạy tới câu kết luận, và bộ tự kiểm mất khả năng chứng minh điều duy
# nhất nó sinh ra để chứng minh. (Đã dính đúng lỗi này ở bản đầu.)
nt_clone_nguoc() {  # $1 bundle · $2 tree kỳ vọng · $3 số commit kỳ vọng · $4 nhãn
  local t="$TAM/cl-$RANDOM"
  if git clone -q --branch main "$1" "$t" 2>/dev/null; then
    local tr n; tr="$(git -C "$t" rev-parse main^{tree})"; n="$(git -C "$t" rev-list --count main)"
    if [ "$tr" = "$2" ] && [ "$n" = "$3" ]; then
      dat "clone ngược ($4): tree khớp tuyệt đối · $n commit · $(git -C "$t" branch -r | grep -c origin/) nhánh"
    else
      truot "clone ngược ($4): tree $tr ≠ $2  hoặc  commit $n ≠ $3"
    fi
  else
    truot "clone ngược ($4): BỊ TỪ CHỐI"
  fi
  return 0
}

nt_ap_patch() {  # $1 thư mục patch · $2 tree kỳ vọng · $3 nhãn
  local t="$TAM/fk-$RANDOM"
  git clone -q --no-local "$FORK" "$t" 2>/dev/null
  git -C "$t" checkout -q --detach "$BASE"
  if git -C "$t" am --keep-cr "$1"/*.patch >"$TAM/am.log" 2>&1; then
    local tr; tr="$(git -C "$t" rev-parse HEAD^{tree})"
    if [ "$tr" = "$2" ]; then
      dat "áp $(ls "$1"/*.patch | wc -l) patch lên $BASE ($3): tree khớp cây fork TỪNG BYTE"
    else
      truot "áp patch ($3): tree $tr ≠ $2"
    fi
  else
    truot "áp patch ($3): git am THẤT BẠI — $(tail -1 "$TAM/am.log")"
  fi
  return 0
}

nt_doi_chung_nguoc() {  # $1 bundle lành — bản cắt cụt PHẢI bị từ chối
  local hong="$TAM/hong.bundle"
  head -c "$(( $(stat -c%s "$1") * 3 / 4 ))" "$1" > "$hong"
  if git clone -q --branch main "$hong" "$TAM/cl-hong" 2>/dev/null; then
    truot "ĐỐI CHỨNG NGƯỢC: bundle cắt cụt VẪN clone được ⇒ phép đo KHÔNG phân biệt được"
  else
    dat "ĐỐI CHỨNG NGƯỢC: bundle cắt cụt bị từ chối ⇒ phép đo biết báo ĐỎ"
  fi
}

nt_quet_bi_mat() {  # $1 = cây đã clone ngược
  # 🔴 `|| true` KHÔNG PHẢI THỪA. `grep` trả mã 1 khi KHÔNG tìm thấy gì, và
  # `set -o pipefail` cho cả pipeline mã 1 kể cả khi `wc` chạy ngon. Tức là ca
  # TỐT — "không có khoá riêng nào" — bị `set -e` xử như lỗi và giết script
  # không in một chữ. Đã dính đúng thế ở lượt chạy thật thứ hai.
  local n_key n_env
  n_key="$(grep -rlE 'BEGIN (RSA|EC|OPENSSH|DSA)? ?PRIVATE KEY' "$1" --exclude-dir=.git 2>/dev/null | wc -l || true)"
  n_env="$(git -C "$1" ls-files | grep -icE '\.env|\.pem$|\.key$|keys?\.txt' || true)"
  if [ "$n_key" -gt 0 ]; then
    truot "QUÉT BÍ MẬT: thấy $n_key tệp chứa khối PRIVATE KEY — KHÔNG ĐƯỢC ĐẨY RA NGOÀI"
    grep -rlE 'BEGIN (RSA|EC|OPENSSH|DSA)? ?PRIVATE KEY' "$1" --exclude-dir=.git | sed 's/^/       /'
  else
    dat "QUÉT BÍ MẬT: không khối PRIVATE KEY nào ($n_env tệp .env/.key — xem lại nếu con số này tăng)"
  fi

  # 🔴 THE SCAN ABOVE CANNOT SEE THE OBJECT DATABASE, AND SAYS SO IN ITS OWN FLAGS.
  # `--exclude-dir=.git` is deliberate — grepping packfiles would be noise — but it means the
  # measurement is about the CHECKED-OUT TREE. A bundle carries every historical object, so a key
  # committed once and deleted the next day travels inside this backup while this function says
  # "no PRIVATE KEY block". It also only knows the PEM shape: neither `PrivateKey-` cb58 nor a
  # bare `0x` EVM key would match even if it were sitting in the working tree.
  # ⇒ D-145's gate reads the objects instead. Run it against the CLONE, not the source repo:
  # what matters here is what this bundle would hand to whoever restores it.
  local ma=0
  node "$ROOT/scripts/check-history-secrets.mjs" --repo "$1" --all-objects >"$TAM/histsec.txt" 2>&1 || ma=$?
  case "$ma" in
    0) dat "QUÉT LỊCH SỬ (D-145): không vật liệu khoá trong kho object của bản lưu" ;;
    2) truot "QUÉT LỊCH SỬ (D-145): KHÔNG ĐO ĐƯỢC — 'không đo được' không phải 'sạch'"
       sed 's/^/       /' "$TAM/histsec.txt" ;;
    *) truot "QUÉT LỊCH SỬ (D-145): CÓ vật liệu khoá trong lịch sử — KHÔNG ĐƯỢC ĐẨY RA NGOÀI"
       sed 's/^/       /' "$TAM/histsec.txt" ;;
  esac
}

# ─────────────────────────────────────────────────────────────────────────────
# Trạng thái nguồn — đọc một lần, dùng khắp nơi.
# ─────────────────────────────────────────────────────────────────────────────
[ -d "$FORK/.git" ] || { echo "✗ không thấy $FORK"; exit 1; }
[ -d "$PATCHES" ]   || { echo "✗ không thấy $PATCHES"; exit 1; }

BASE="$(cat "$FORK/.git/shallow" 2>/dev/null | head -1)"
[ -n "$BASE" ] || BASE="$(git -C "$FORK" rev-list --max-parents=0 HEAD | head -1)"

if [ "$CHE_DO" = "kiem" ]; then kiem_tuoi; exit $?; fi

TAM="$(mktemp -d -t a1-h6b-XXXXXX)"

if [ "$CHE_DO" = "tu-kiem" ]; then
  # ═══ CHỨNG MINH CỔNG NÀY BIẾT ĐỎ ═══
  # Một cổng chỉ từng xanh không chứng minh gì. Bốn ca dưới đây là bốn cách bản sao
  # lưu hỏng THẬT; cả bốn PHẢI ra đỏ. Ca nào ra xanh nghĩa là cổng đang đo sai
  # đại lượng, và lúc đó con số "4/4 đạt" ở lượt chạy thật là vô nghĩa.
  echo "── TỰ KIỂM: bốn ca, mỗi ca một CẶP lành/hỏng ──"
  git -C "$ROOT" bundle create "$TAM/that.bundle" --all >/dev/null 2>&1
  TREE_MAIN="$(git -C "$ROOT" rev-parse main^{tree})"
  N_MAIN="$(git -C "$ROOT" rev-list --count main)"
  TREE_FORK="$(git -C "$FORK" rev-parse HEAD^{tree})"

  # Mỗi ca: chạy bản LÀNH (phải xanh) rồi bản HỎNG (phải đỏ). Chỉ có cặp đó mới
  # chứng minh được cổng **phân biệt được** — một cổng luôn đỏ cũng "bắt" được
  # mọi lỗi mà chẳng nói lên điều gì.
  echo "ca 1 — bundle cắt cụt:"
  L0=$LOI; nt_clone_nguoc "$TAM/that.bundle" "$TREE_MAIN" "$N_MAIN" "bản lành, phải XANH"
  [ $LOI -eq $L0 ] || { echo "   🔴 bản LÀNH lại ra đỏ — cổng hỏng"; exit 1; }
  head -c 2000000 "$TAM/that.bundle" > "$TAM/cut.bundle"
  L0=$LOI; nt_clone_nguoc "$TAM/cut.bundle" "$TREE_MAIN" "$N_MAIN" "bản cắt cụt, phải ĐỎ"
  if [ $LOI -gt $L0 ]; then echo "   → ca 1 ra đỏ đúng như phải thế"; LOI=$L0
  else echo "   🔴 ca 1 KHÔNG ra đỏ"; exit 1; fi

  echo "ca 2 — thiếu một patch:"
  mkdir -p "$TAM/thieu"; cp "$PATCHES"/*.patch "$TAM/thieu/"
  rm -f "$(ls "$TAM/thieu"/*.patch | tail -1)"
  L0=$LOI; nt_ap_patch "$TAM/thieu" "$TREE_FORK" "thiếu 1 patch, phải ĐỎ"
  if [ $LOI -gt $L0 ]; then echo "   → ca 2 ra đỏ đúng như phải thế"; LOI=$L0
  else echo "   🔴 ca 2 KHÔNG ra đỏ — thiếu patch mà tree vẫn khớp là chuyện không thể"; exit 1; fi

  echo "ca 3 — đối chứng ngược tự nó (bản lành phải sống sót):"
  L0=$LOI; nt_doi_chung_nguoc "$TAM/that.bundle"
  if [ $LOI -eq $L0 ]; then echo "   → ca 3 đạt"; else echo "   🔴 ca 3 hỏng"; exit 1; fi

  # Ca 4 canh CỔNG --check, không canh bản sao lưu. Nó là ca quan trọng nhất của
  # bộ này: A-001 chưa bao giờ hỏng vì bản sao lưu hỏng — nó hỏng vì bản sao lưu
  # LÀNH mà CŨ, và không phép đo nào phân biệt được hai thứ đó.
  echo "ca 4 — cổng --check trước một bản sao lưu CŨ (lành nhưng lạc hậu):"
  kho_that="$KHO"; gia="$TAM/kho-gia/9chain-a1-backup-19700101-000000"
  mkdir -p "$gia/avalanchego-patches"
  # HEAD lùi 50 commit + khai thiếu patch = đúng hình dạng bản 27/08 đã để lọt.
  cat > "$gia/manifest.env" <<EOF2
HEAD=$(git -C "$ROOT" rev-parse --short main~50)
PATCH=1
EOF2
  touch "$gia/avalanchego-patches/0001-gia.patch"
  KHO="$TAM/kho-gia"
  if kiem_tuoi >/dev/null 2>&1; then
    KHO="$kho_that"; echo "   🔴 ca 4 KHÔNG ra đỏ — cổng --check không phân biệt được CŨ với TƯƠI"; exit 1
  fi
  KHO="$kho_that"
  echo "   → ca 4 ra đỏ đúng như phải thế"
  # Và vế xanh: bản thật hiện có không được ra đỏ vì lý do vớ vẩn.
  if kiem_tuoi >/dev/null 2>&1; then echo "   → vế xanh: bản hiện có vẫn đạt"
  else echo "   ⚠ bản sao lưu hiện có ĐANG ĐỎ — không phải lỗi của bộ tự kiểm, chạy lại H-6b"; fi

  echo; echo "✓ TỰ KIỂM ĐẠT — cổng này phân biệt được bản lành với bản hỏng, và CŨ với TƯƠI."
  exit 0
fi

# ═══ LƯỢT DỰNG THẬT ═══
if [ -n "$(git -C "$ROOT" status --porcelain)" ]; then
  echo "🔴 CÂY LÀM VIỆC CÒN THAY ĐỔI CHƯA COMMIT."
  echo "   Sao lưu lúc này sẽ bỏ sót chúng — bundle chỉ chứa thứ đã commit."
  git -C "$ROOT" status --short | sed 's/^/     /'
  exit 1
fi

TS="$(date -u +%Y%m%d-%H%M%S)"
D="$KHO/9chain-a1-backup-$TS"
HEAD_SHA="$(git -C "$ROOT" rev-parse --short main)"
TREE_MAIN="$(git -C "$ROOT" rev-parse main^{tree})"
N_MAIN="$(git -C "$ROOT" rev-list --count main)"
N_TEP="$(git -C "$ROOT" ls-files | wc -l)"
TREE_FORK="$(git -C "$FORK" rev-parse HEAD^{tree})"
N_PATCH="$(ls "$PATCHES" | wc -l)"

echo "── H-6b · $TS UTC ──"
echo "   repo main $HEAD_SHA · $N_MAIN commit · $N_TEP tệp · tree $TREE_MAIN"
echo "   fork base $BASE (shallow) · $N_PATCH patch · tree $TREE_FORK"
echo

mkdir -p "$D/avalanchego-patches"
git -C "$ROOT" bundle create "$D/9chain-a1.bundle" --all >/dev/null 2>&1
cp "$PATCHES"/*.patch "$D/avalanchego-patches/"

cat > "$D/manifest.env" <<EOF
# Máy đọc. Bản cho người ở MANIFEST.txt.
TS=$TS
HEAD=$HEAD_SHA
COMMIT=$N_MAIN
TREE=$TREE_MAIN
BASE=$BASE
PATCH=$N_PATCH
FORK_TREE=$TREE_FORK
EOF

cat > "$D/MANIFEST.txt" <<EOF
9Chain-A1 — BẢN SAO LƯU $TS UTC   (sinh bởi scripts/h6b-backup.sh)
Nguồn: $ROOT

== REPO 9Chain-A1 ==
  HEAD          $HEAD_SHA  $(git -C "$ROOT" log -1 --format=%s main | cut -c1-60)
  commit        $N_MAIN
  tree          $TREE_MAIN
  tệp theo dõi  $N_TEP
  nhánh         $(git -C "$ROOT" branch --format='%(refname:short)' | tr '\n' ' ')

== FORK avalanchego (lớp chủ quyền) ==
  base upstream $BASE   (fork là SHALLOW clone, ranh giới ở đây)
  patch         $N_PATCH
  tree sau khi áp $TREE_FORK
  áp bằng:      git am --keep-cr

== 🔴 BẢN SAO LƯU NÀY KHÔNG CHỨA GÌ ==
  KHÔNG chứa khoá 5 quỹ. local-net/net-*/keys.txt bị .gitignore — CỐ Ý.
  Mất máy dev vẫn = mất khoá cả 5 quỹ. Xem D-044 và GDAY-A1-REMAINING.md O1.
EOF

cat > "$D/RESTORE.md" <<'EOF'
# Phục hồi 9Chain-A1 từ bản sao lưu này

## 1. Repo
```
git clone --branch main 9chain-a1.bundle 9Chain-A1
cd 9Chain-A1 && git rev-parse main^{tree}     # phải khớp TREE trong manifest.env
```
Bundle chứa TẤT CẢ các nhánh, không chỉ `main`.

## 2. Lớp chủ quyền (fork avalanchego)
Fork là SHALLOW clone nên `git bundle` của nó sinh ra BACKUP GIẢ (`git bundle
verify` khen "okay" nhưng clone ngược chết). Vì thế ở đây dùng patch series:
```
git clone https://github.com/ava-labs/avalanchego.git
cd avalanchego && git checkout --detach <BASE trong manifest.env>
git am --keep-cr ../avalanchego-patches/*.patch
git rev-parse HEAD^{tree}                     # phải khớp FORK_TREE
```
So bằng TREE HASH, không so commit hash: `git am` ghi lại committer nên commit
hash đổi mà cây mã nguồn vẫn đúng từng byte.

## 3. Thứ còn thiếu — đọc trước khi tưởng đã phục hồi xong
KHOÁ 5 QUỸ KHÔNG CÓ Ở ĐÂY (cố ý). Không có chúng thì phục hồi được MÃ nhưng
không phục hồi được quyền chi tiêu của genesis. Xem D-044.
EOF

( cd "$D" && sha256sum 9chain-a1.bundle MANIFEST.txt RESTORE.md manifest.env \
    avalanchego-patches/*.patch > SHA256SUMS.txt )

echo "── NGHIỆM THU (bốn phép, chạy thật) ──"
nt_clone_nguoc "$D/9chain-a1.bundle" "$TREE_MAIN" "$N_MAIN" "máy dev"
nt_ap_patch    "$D/avalanchego-patches" "$TREE_FORK" "máy dev"
nt_doi_chung_nguoc "$D/9chain-a1.bundle"
# 🔴 VIẾT BẰNG `if`, KHÔNG BẰNG `[ … ] && ham`.
# Dạng `A && B` ở cuối script là một lệnh có mã thoát: A sai ⇒ cả list trả 1 ⇒
# `set -e` giết script **không in một chữ nào**. Đã dính thật ở lượt chạy đầu:
# ba phép nghiệm thu in ✓ rồi script chết câm với EXIT=1. Một cổng chết câm còn
# tệ hơn một cổng không có, vì nó trông như đã chạy.
CAY="$(ls -d "$TAM"/cl-* 2>/dev/null | head -1 || true)"
if [ -n "$CAY" ]; then
  nt_quet_bi_mat "$CAY"
else
  truot "QUÉT BÍ MẬT: không tìm thấy cây đã clone ngược để quét"
fi

if [ $LOI -gt 0 ]; then
  echo; echo "🔴 $LOI PHÉP TRƯỢT — bản sao lưu KHÔNG đạt, KHÔNG đẩy lên máy chủ."
  echo "   Bản dở nằm ở: $D  (giữ lại để soi, xoá bằng tay khi xong)"
  exit 1
fi

if [ "$DAY_LEN_SERVER" = "0" ]; then
  echo; echo "✓ nghiệm thu đạt. Bỏ qua bước đẩy (--khong-day)."
  echo "  🔴 NHẮC: bản này nằm CÙNG Ổ ĐĨA với repo ⇒ nó CHƯA phải bản thứ hai thật."
  exit 0
fi

# ── Bản thứ hai THẬT: một máy khác ──
# Bản trong $KHO nằm cùng ổ đĩa với repo. Ổ đó hỏng là mất cả hai cùng lúc, nên
# tự nó KHÔNG đếm là bản thứ hai.
echo
echo "── ĐẨY LÊN MÁY CHỦ ($MAY_CHU) ──"
ssh -i "$KHOA_SSH" -o StrictHostKeyChecking=no -o BatchMode=yes "$MAY_CHU" "mkdir -p $DICH_XA/$TS"
scp -i "$KHOA_SSH" -o StrictHostKeyChecking=no -q -r "$D"/* "$MAY_CHU:$DICH_XA/$TS/"

OK_XA="$(ssh -i "$KHOA_SSH" -o StrictHostKeyChecking=no -o BatchMode=yes "$MAY_CHU" \
  "cd $DICH_XA/$TS && sha256sum -c SHA256SUMS.txt 2>/dev/null | grep -c ': OK'")"
TONG="$(wc -l < "$D/SHA256SUMS.txt")"
if [ "$OK_XA" = "$TONG" ]; then dat "sha256 hai đầu: $OK_XA/$TONG khớp"; else truot "sha256 hai đầu: chỉ $OK_XA/$TONG"; fi

# Clone ngược NGAY TRÊN MÁY CHỦ — chứng minh bản offsite tự nó dựng lại được,
# không chỉ chứng minh các byte đã tới nơi.
XA_TREE="$(ssh -i "$KHOA_SSH" -o StrictHostKeyChecking=no -o BatchMode=yes "$MAY_CHU" \
  "T=\$(mktemp -d); git clone -q --branch main $DICH_XA/$TS/9chain-a1.bundle \$T/r 2>/dev/null && git -C \$T/r rev-parse main^{tree}; rm -rf \$T")"
if [ "$XA_TREE" = "$TREE_MAIN" ]; then dat "clone ngược TRÊN MÁY CHỦ: tree khớp tuyệt đối"; else truot "clone ngược trên máy chủ: $XA_TREE ≠ $TREE_MAIN"; fi

echo
if [ $LOI -gt 0 ]; then echo "🔴 $LOI PHÉP TRƯỢT."; exit 1; fi
echo "✓ H-6b ĐẠT — hai nơi, sáu phép nghiệm thu, đối chứng ngược đã chạy."
echo "    $D"
echo "    $MAY_CHU:$DICH_XA/$TS"
echo
echo "🔴 KHÔNG ĐƯỢC ĐỌC THÀNH \"ĐÃ AN TOÀN\": khoá 5 quỹ vẫn KHÔNG có bản nào ngoài"
echo "   máy dev (D-044 / O1). Script này chưa bao giờ cứu khoá."
