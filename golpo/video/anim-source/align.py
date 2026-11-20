import re, json, subprocess, sys
src = open('/home/user/your-mac/golpo/video/kadher-bhar-voice-script.md', encoding='utf8').read()
# lines with scene index
scene = 0; lines = []
for ln in src.splitlines():
    m = re.match(r'## দৃশ্য', ln)
    if m: scene += 1; continue
    if ln.startswith('['):
        txt = re.sub(r'\[[^\]]*\]\s*', '', ln).strip()
        lines.append((scene, txt))
# units: split at ... and sentence ends
units = []
for li, (sc, txt) in enumerate(lines):
    parts = re.split(r'(?<=\.\.\.)|(?<=[।?])\s+', txt)
    for p in parts:
        p = p.strip()
        if p: units.append(dict(scene=sc, line=li, text=p, n=len(re.sub(r'[\s\."“”,]', '', p))))
aud = sys.argv[1]
out = subprocess.run(['ffmpeg','-hide_banner','-i',aud,'-af','silencedetect=noise=-35dB:d=0.25','-f','null','-'],capture_output=True,text=True).stderr
ss=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',out)]; se=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',out)]
dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',aud],capture_output=True,text=True).stdout)
# speech segments
segs=[]; cur=0.0
pairs=[]
if ss and ss[0] < 0.05: pass
starts=[0.0]+se; ends=ss+[dur]
# handle leading silence: if first silence_start ~0, first speech start is se[0]
ev=sorted([(s,'s') for s in ss]+[(e,'e') for e in se])
t=0.0; insil=False; segs=[]
for x,k in ev:
    if k=='s':
        if x-t>0.05: segs.append([t,x])
        insil=True
    else:
        t=x; insil=False
if not insil and dur-t>0.05: segs.append([t,dur])
U=len(units); S=len(segs)
tot_chars=sum(u['n'] for u in units); tot_sp=sum(b-a for a,b in segs); rate=tot_sp/tot_chars
INF=1e18
dp=[[INF]*(S+1) for _ in range(U+1)]; bk=[[None]*(S+1) for _ in range(U+1)]
dp[0][0]=0
for i in range(U+1):
    for j in range(S+1):
        if dp[i][j]>=INF: continue
        for du in range(1,5):
            if i+du>U: break
            ch=sum(units[k]['n'] for k in range(i,i+du))
            for ds in range(1,5):
                if j+ds>S: break
                d=sum(segs[k][1]-segs[k][0] for k in range(j,j+ds))
                c=(d-ch*rate)**2/(ch*rate+0.5)+0.3*(du-1)+0.3*(ds-1)
                if dp[i][j]+c<dp[i+du][j+ds]:
                    dp[i+du][j+ds]=dp[i][j]+c; bk[i+du][j+ds]=(i,j)
i,j=U,S; groups=[]
while i>0:
    pi,pj=bk[i][j]; groups.append((pi,i,pj,j)); i,j=pi,pj
groups.reverse()
for (a,b,c,d) in groups:
    gs=segs[c:d]; ch=[units[k]['n'] for k in range(a,b)]; total=sum(ch)
    sp=sum(y-x for x,y in gs)
    # map char offset -> time across segments
    def at(off):
        rem=off/total*sp
        for x,y in gs:
            if rem<=y-x+1e-9: return x+rem
            rem-=y-x
        return gs[-1][1]
    acc=0
    for k,cn in zip(range(a,b),ch):
        units[k]['start']=round(at(acc),2); acc+=cn; units[k]['end']=round(at(acc),2)
json.dump(dict(duration=dur,units=units,segs=segs),open('timing.json','w'),ensure_ascii=False,indent=0)
sc={}
for u in units: sc.setdefault(u['scene'],[u['start'],u['end']]); sc[u['scene']][1]=u['end']
for k,v in sc.items(): print(k, v)
print('units',U,'segs',S,'cost',round(dp[U][S],2))
