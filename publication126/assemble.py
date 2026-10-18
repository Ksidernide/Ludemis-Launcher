from pathlib import Path
import gzip,hashlib,json
root=Path(__file__).resolve().parents[1]
cfg=json.loads((root/'publication126/manifest.json').read_text())
raw=gzip.decompress(b''.join((root/p).read_bytes() for p in cfg['parts']))
assert len(raw)==cfg['size'], 'Unexpected executable size'
assert hashlib.sha256(raw).hexdigest()==cfg['sha256'], 'Unexpected executable digest'
assert raw[:2]==b'MZ', 'Not a Windows executable'
(root/cfg['name']).write_bytes(raw)
(root/'SHA256SUMS.txt').write_text(cfg['sha256']+'  '+cfg['name']+'\n')
print('Official Windows executable reconstructed and SHA-256 verified.')
