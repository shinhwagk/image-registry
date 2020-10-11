# push 
```
shinhwagk@DESKTOP-V3FAQ1B:/mnt/c/Users/shinh$ time docker push  127.0.0.1:5001/library/node:12
The push refers to repository [127.0.0.1:5001/library/node]
4471b89c2ccf: Pushed
d1121c57fa53: Pushed
5f9816bb7c84: Pushed
174e334f3f46: Pushed
cbe6bbd0c86f: Pushed
ef5de533cb53: Pushed
a4c504f73441: Pushed
e8847c2734e1: Pushed
b323b70996e4: Pushed
12: digest: sha256:def147f4462a51c43c08eff0c87f7addf46f71a1c879db62b89f607b4b1708a8 size: 2215

real    0m33.787s
user    0m0.213s
sys     0m0.137s
shinhwagk@DESKTOP-V3FAQ1B:/mnt/c/Users/shinh$ time docker push  127.0.0.1:8003/library/node:121
The push refers to repository [127.0.0.1:8003/library/node]
4471b89c2ccf: Pushed
d1121c57fa53: Pushed
5f9816bb7c84: Pushed
174e334f3f46: Pushed
cbe6bbd0c86f: Pushed
ef5de533cb53: Pushed
a4c504f73441: Pushed
e8847c2734e1: Pushed
b323b70996e4: Pushed
121: digest: sha256:72e50a41c1aac6b588b26870256e5e4c095572511812db6d255ce2346f0918b6 size: 2212

real    0m30.237s
user    0m0.141s
sys     0m0.166s
```