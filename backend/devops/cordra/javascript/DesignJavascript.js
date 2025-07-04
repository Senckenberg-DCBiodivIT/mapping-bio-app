const cordraUtil = require("cordraUtil");

const AUTH_CONFIG_FILE = "keycloakConfig.json";
const ROLE_PREFIX = "biodt::";

let keycloakConfig = null;
exports.authenticate = authenticate;

function authenticate(authInfo, context) {
  cacheKeyIfNeeded();
  if (isTokenAuthentication(authInfo)) {
    return checkCredentials(authInfo);
  } else {
    return null;
  }
}

function isTokenAuthentication(authInfo) {
  if (authInfo.token) {
    if (isJwtFromProvider(authInfo.token)) {
      return true;
    }
  }
  return false;
}

function isJwtFromProvider(token) {
  if (!token.includes(".")) {
    return false;
  }
  try {
    const claims = cordraUtil.extractJwtPayload(token);
    return claims.iss === keycloakConfig.iss;
  } catch (error) {
    console.log("Error when trying to extract jwtpayload: ", error);
    return false;
  }
}

function checkCredentials(authInfo) {
  const token = authInfo.token;
  const payload = cordraUtil.extractJwtPayload(token);
  const isVerified = cordraUtil.verifyWithKey(token, keycloakConfig.jwk);
  const claimsCheck = checkClaims(payload);
  const active = isVerified && claimsCheck;
  const result = {
    active: active,
    groupIds: [],
  };
  if (active) {
    result.userId = payload.sub;
    if (payload.preferred_username === "admin") {
      result.userId = "admin";
    }
    // here we persist roleIds as goupIds
    if (payload.realm_access && Array.isArray(payload.realm_access.roles)) {
      for (let i = 0; i < payload.realm_access.roles.length; i++) {
        const role = payload.realm_access.roles[i];
        if (role.startsWith(ROLE_PREFIX)) {
          result.groupIds.push(role);
        }
      }
    }

    if (payload.preferred_username) {
      result.username = payload.preferred_username;
    }
    if (payload.exp) {
      result.exp = payload.exp;
    }
    result.grantAuthenticatedAccess = true;
  }
  return result;
}

function isBasicAuth(authHeader) {
  return authHeader.startsWith("Basic ");
}

function isBearerTokenAuth(authHeader) {
  return authHeader.startsWith("Bearer ");
}

function getTokenFromAuthHeader(authHeader) {
  return authHeader.substring(authHeader.indexOf(" ") + 1);
}

function checkClaims(claims) {
  if (!claims.iss || !claims.exp || !claims.aud) {
    return false;
  }
  if (keycloakConfig.iss !== claims.iss) {
    return false;
  }
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (nowInSeconds > claims.exp) {
    return false;
  }
  const aud = claims.aud;
  if (!checkAudience(aud)) {
    return false;
  }
  return true;
}

function checkAudience(audElement) {
  let aud = [];
  if (typeof audElement === "string") {
    aud.push(audElement);
  } else if (Array.isArray(audElement)) {
    aud = audElement;
  } else {
    return false;
  }
  let audIncluded = false;
  for (let i = 0; i < keycloakConfig.aud.length; i++) {
    const audItem = keycloakConfig.aud[i];
    if (aud.includes(audItem)) {
      audIncluded = true;
    }
  }
  return audIncluded;
}

function cacheKeyIfNeeded() {
  if (!keycloakConfig) {
    const configDir = getDataDir();
    const File = Java.type("java.io.File");
    const keyPath = configDir + File.separator + AUTH_CONFIG_FILE;
    keycloakConfig = readFileToJsonAndParse(keyPath);
  }
}

function getDataDir() {
  const System = Java.type("java.lang.System");
  const cordraDataDir = System.getProperty("cordra.data");
  return cordraDataDir;
}

function readFileToString(pathToFile) {
  const path = Java.type("java.nio.file.Paths").get(pathToFile);
  const string = Java.type("java.nio.file.Files").readString(path);
  return string;
}

function readFileToJsonAndParse(pathToFile) {
  const jsonString = readFileToString(pathToFile);
  const result = JSON.parse(jsonString);
  return result;
}
