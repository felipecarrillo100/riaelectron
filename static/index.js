const cognitoServer = "https://hxdr-uat-dr-userpool-cgn.auth.eu-west-1.amazoncognito.com/";

const CODE_VERIFIER_PREFIX = 'CODE_VERIFIER_';
const TOKEN_ENDPOINT = `${cognitoServer}/oauth2/token`;
const LOGOUT_ENDPOINT = `${cognitoServer}/logout`;

const __accessToken = "hxdr-access-token";
const __refreshToken = "hxdr-refresh-token";

let hxdrToken = {
    getAccessToken() {
        return window.sessionStorage.getItem(__accessToken);
    },
    setAccessToken(token) {
        window.sessionStorage.setItem(__accessToken, token);
    },
    getRefreshToken() {
        return window.sessionStorage.getItem(__refreshToken);
    },
    setRefreshToken(token) {
        window.sessionStorage.setItem(__refreshToken, token);
    },
    closeWindow(refreshToken, accessToken) {
        window.ipcRenderer?.send("hxdr", {
            type: "closeWindow",
            refreshToken,
            accessToken
        });
    }
}

const refreshToken = hxdrToken.getRefreshToken()

if (refreshToken) {
    requestAccessToken(refreshToken).then(accessToken=>{
        hxdrToken.setAccessToken(accessToken);
        hxdrToken.closeWindow(refreshToken, accessToken);
    }, err=> {
        redirectToCognito();
    });
} else {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const stateParam = urlParams.get('state');

    if (code) {
        requestRefreshToken(code, stateParam).then(token=>{
            hxdrToken.setRefreshToken(token);
            requestAccessToken(refreshToken).then(accessToken=>{
                hxdrToken.setAccessToken(token);
                hxdrToken.closeWindow(refreshToken, accessToken);
            }, err=> {
                redirectToCognito();
            });
        }, err=> {
            redirectToCognito()
        });
    } else {
        redirectToCognito();
    }
}

console.log("Success")


function redirectToCognito() {
    const method= "S256"
    const state = uuidv4();
    const codeVerifier = uuidv4();
    sha256(codeVerifier).then(value =>{
        const codeChallenge = base64UrlEncode(value );
        const client_id = clientID;
        const redirect_uri = getAppHome();
        const aLink = `${cognitoServer}/login?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=${method}`;
        window.sessionStorage.setItem(CODE_VERIFIER_PREFIX + state, codeVerifier);
        window.location = aLink;
    }, err=>{
        console.log("Err")
    });}

function getAppHome() {
    return window.location.origin + window.location.pathname;
}

async function sha256(str){
    return await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
}

function uuidv4(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function base64UrlEncode(str) {
    return btoa(String.fromCharCode(...new Uint8Array(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function requestRefreshToken(code, stateParam) {
    return new Promise((resolve, reject) => {
        const codeVerifier = window.sessionStorage.getItem(
            CODE_VERIFIER_PREFIX + stateParam
        );
        if (code && stateParam && codeVerifier) {
            this.fetchTokensUsingCode(code, codeVerifier).then((data) => {
                hxdrToken.setRefreshToken(data.refresh_token);
                // @ts-ignore
                window.location = getAppHome();
            });
        } else {
            reject();
        }
    });
}

function requestAccessToken(refreshToken) {
        return new Promise((resolve, reject) => {
                if (refreshToken) {
                    this.fetchTokensUsingRefresh(refreshToken).then((data)=>{
                        resolve(data.access_token);
                    }, (err)=>{
                        reject();
                    });
                } else {
                    reject();
                }
        })
}

function fetchTokensUsingCode(code, codeVerifier) {
    return new Promise((resolve, reject) => {
        fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientID,
                code,
                redirect_uri: getAppHome(),
                code_verifier: codeVerifier,
            }),
        }).then(response => {
            if (response.ok) {
                response.json().then( data => {
                    resolve(data);
                }, err => {
                    reject({err: 'error when fetching tokens'});
                })
            } else {
                reject({err: 'error when fetching tokens'});
            }
        }, err => {
            console.log(err);
            reject({err: 'error when fetching tokens'});
        })
    })
}

function fetchTokensUsingRefresh(refreshToken) {
    return new Promise((resolve, reject) => {
        fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: clientID,
                refresh_token: refreshToken,
            }),
        }).then(response => {
            if (response.ok) {
                response.json().then( data => {
                    resolve(data);
                }, err => {
                    reject({err: 'error when fetching tokens'});
                })
            } else {
                reject({err: 'error when fetching tokens'});
            }
        }, err => {
            console.log(err);
            reject({err: 'error when fetching tokens'});
        })
    })
}

function logout() {
    hxdrToken.setRefreshToken(null);
    const client_id = clientID;
    const appHome = getAppHome();
    // @ts-ignore
    window.location = `${LOGOUT_ENDPOINT}?client_id=${client_id}&logout_uri=${appHome}`;
}
