class CodeSnippets
{
    constructor()
    {

    }

    /**
     * Inject CSS into the browser/steam client.
     * Run as few times as possible, unless you're making changes to the CSS.
     * @author Spedwards
     * @param {string} CSS - A string containing all your rules.
     * @param {string} styleID - A unique ID to identify the style element.
     *
     * USER: @spedwards @icon
     *
     * USAGE:
     *  - injectCSS('.room-mineral-type { opacity: 0.5 }', 'transparentMinerals');
     *      - makes the minrals in the worldmap opaque
     */
    function injectCSS(CSS, styleID)
    {
    	console.log(`<script>` +
    				`var node = document.getElementById("${styleID}");` +
    				`if (node === null) {` +
    				`let style = document.createElement("style");` +
    				`style.id = "${styleID}";` +
    				`document.body.appendChild(style);` +
    				`}` +
    				`document.getElementById("${styleID}").innerHTML = "${CSS}";` +
    				`</script>`);
    }
}
module.exports = CodeSnippets
