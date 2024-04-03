import { Injectable } from '@angular/core';

@Injectable()


export class OgcatUser {
    
    /**
     * @param info 
     * providerId: "google.com"  
     * providerId: "facebook.com"  
     * providerId: "password"
     */
    setUserInfo(info){
       
        let userInfo = {
            displayName: info.displayName,
            email: info.email,
            emailVerified: info.emailVerified,
            metadata: info.metadata,
            uid: info.uid,
            photoURL:info.photoURL,
            providerId:info.providerData[0].providerId
        }
       
        localStorage.setItem("userInfo", JSON.stringify(userInfo) );
        localStorage.removeItem("userInfo_o");
        //localStorage.setItem("userInfo_o", JSON.stringify(info) );
        return userInfo;
    }
}
/**
 displayName: "..."
email: "...m"
phoneNumber: null
photoURL: "..."
providerId: "google.com"
uid: "fbuid/googleuid"
 */