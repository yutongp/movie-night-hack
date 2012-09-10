s = raw_input()
while s!=".":
    x = s.split()
    string = x[0]
    n = int(x[1])
    blob = string*n
    i=0
    while i!=len(blob):
        print blob[i:]+blob[:i]
        i+=1
    s = raw_input()
