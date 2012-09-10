#include<iostream>
#include<cstring>
using namespace std;

int main() {
        string s;
        int n;
        cin>>s;
        if(s==".") return 0;
        cin>>n;
        while(1)
        {
            string final="";
            for(int i=0;i<n;i++)
                final+=s;
            for(int i=0;i<final.size();i++)
                cout<<final.substr(i)+final.substr(0,i)<<endl;
            cin>>s;
            if(s==".") break;
            cin>>n;
        }
        return 0;
}
