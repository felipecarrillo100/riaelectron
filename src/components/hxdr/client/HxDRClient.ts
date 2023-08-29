import {electronBridge} from "../../../electronbridge/Bridge";
import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    InMemoryCacheConfig
} from "@apollo/client";
import {getHxDRAccessToken} from "../tokens/HxDRTokens";
import introspection from "./introspection";
import {setContext} from "@apollo/client/link/context";

export const CacheSettings:  InMemoryCacheConfig = {
    addTypename: true,
    possibleTypes: introspection.possibleTypes,
}

function getUrl() {
    const x = electronBridge.hxdrServer.getUrl()+"/graphql";
    console.log(x);
    return x;
}

const apolloHttpLink = createHttpLink({
    uri: getUrl(),
})

const apolloAuthContext = setContext(async (_, {headers}) => {
    const token= getHxDRAccessToken();
    const authorization = token ? `Bearer ${token}` : "";
    return {
        headers: {
            ...headers,
            authorization
        },
    }
})
export const createNewApolloClient = () => {
    const client = new ApolloClient({
        link: apolloAuthContext.concat(apolloHttpLink),
        cache: new InMemoryCache(CacheSettings)
    });
    console.log(client);
    return client;
}
