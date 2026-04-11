"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectEmbeddingSupport = inspectEmbeddingSupport;
exports.inspectEmbeddingHeaders = inspectEmbeddingHeaders;
async function inspectEmbeddingSupport(url) {
    try {
        const response = await requestForEmbeddingInspection(url, 'HEAD');
        const inspection = inspectEmbeddingHeaders(response.headers);
        if (inspection) {
            return inspection;
        }
        return { canEmbed: true };
    }
    catch {
        try {
            const response = await requestForEmbeddingInspection(url, 'GET');
            const inspection = inspectEmbeddingHeaders(response.headers);
            if (inspection) {
                return inspection;
            }
            return { canEmbed: true };
        }
        catch {
            return {
                canEmbed: true,
                warning: 'Unable to pre-check iframe support. SideBrowser will try to load the page directly.'
            };
        }
    }
}
async function requestForEmbeddingInspection(url, method) {
    return fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(5000)
    });
}
function inspectEmbeddingHeaders(headers) {
    const xFrameOptions = headers.get('x-frame-options');
    if (xFrameOptions && /deny|sameorigin|allow-from/i.test(xFrameOptions)) {
        return {
            canEmbed: false,
            blockedBy: 'x-frame-options',
            reason: `Target responded with X-Frame-Options: ${xFrameOptions}.`
        };
    }
    const csp = headers.get('content-security-policy');
    if (!csp) {
        return undefined;
    }
    const frameAncestors = extractFrameAncestors(csp);
    if (!frameAncestors) {
        return undefined;
    }
    const normalized = frameAncestors.toLowerCase();
    const appearsEmbeddable = normalized.includes('*') ||
        normalized.includes('vscode-webview:') ||
        normalized.includes('vscode-webview://');
    if (appearsEmbeddable) {
        return undefined;
    }
    return {
        canEmbed: false,
        blockedBy: 'csp-frame-ancestors',
        reason: `Target responded with Content-Security-Policy frame-ancestors ${frameAncestors}.`
    };
}
function extractFrameAncestors(csp) {
    const directive = csp
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.toLowerCase().startsWith('frame-ancestors'));
    if (!directive) {
        return undefined;
    }
    return directive.slice('frame-ancestors'.length).trim();
}
//# sourceMappingURL=embedding.js.map