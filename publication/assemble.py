import gzip, hashlib, io, json, pathlib, re, struct
root=pathlib.Path(__file__).resolve().parent
config=json.loads((root/'release.json').read_text(encoding='utf-8'))
version=config['version']
assert re.fullmatch(r'[0-9]{1,6}\.[0-9]{1,6}(?:\.[0-9]{1,6})?',version)
parts=sorted(root.glob('Ludemis.exe.gz.part*'))
assert len(parts)==config['parts']
data=gzip.decompress(b''.join(p.read_bytes() for p in parts))
if 'patch_parts' in config:
 assert hashlib.sha256(data).hexdigest()==config['base_sha256']
 parts=sorted(root.glob('Ludemis.delta.gz.part*'))
 assert len(parts)==config['patch_parts']
 stream=io.BytesIO(gzip.decompress(b''.join(p.read_bytes() for p in parts)))
 assert stream.read(9)==b'LUDDELTA1'
 out=bytearray()
 while tag:=stream.read(1):
  if tag==b'C':
   offset,count=struct.unpack('<II',stream.read(8));assert offset+count<=len(data);out.extend(data[offset:offset+count])
  elif tag==b'D':
   count,=struct.unpack('<I',stream.read(4));chunk=stream.read(count);assert len(chunk)==count;out.extend(chunk)
  else:raise ValueError('Invalid patch instruction')
  assert len(out)<=config['size']
 data=bytes(out)
assert data[:2]==b'MZ' and len(data)==config['size']
assert hashlib.sha256(data).hexdigest()==config['sha256']
pathlib.Path('Ludemis.exe').write_bytes(data)
pathlib.Path('Ludemis-'+version+'.exe').write_bytes(data)
pathlib.Path('version.txt').write_text(version)
pathlib.Path('notes.txt').write_text(config['notes'],encoding='utf-8')
pathlib.Path('SHA256SUMS.txt').write_text(config['sha256']+'  Ludemis-'+version+'.exe\n')
print('Verified executable:',version,config['sha256'])
