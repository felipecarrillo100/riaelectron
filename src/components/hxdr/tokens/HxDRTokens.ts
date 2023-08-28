const accessToken = "hxdr-access-token";
const refreshToken = "hxdr-request-token";
export function getHxDRAccessToken() {
    return window.sessionStorage.getItem(accessToken);
}

export function getHxDRRefreshToken() {
    return window.sessionStorage.getItem(refreshToken);
}

export function setHxDRAccessToken(token: string | null) {
    if (!token) {
        window.sessionStorage.removeItem(accessToken)
    } else {
        return window.sessionStorage.setItem(accessToken, token);
    }
}

export function setHxDRRefreshToken(token:string | null) {
    if (!token) {
        window.sessionStorage.removeItem(refreshToken)
    } else {
        return window.sessionStorage.setItem(refreshToken, token);
    }
}
