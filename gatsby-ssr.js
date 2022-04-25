// @ts-check
import Provider from "./src/utils/context"

/** @type {import('gatsby').GatsbySSR['onPreRenderHTML']} */
export const onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
	if (process.env.NODE_ENV !== "production") return

	const headComponents = getHeadComponents()
	headComponents.forEach(/** @param {any} el */ el => {
		if (el.type === "style" && el.props["data-href"]) {
			el.type = "link"
			el.props.href = el.props["data-href"]
			el.props.rel = "stylesheet"
			el.props.type = "text/css"

			delete el.props["data-href"]
			delete el.props.dangerouslySetInnerHTML
		}
	})

	// Add a tiny bit of JS code to deal with the dark mode setting super early.
	// Also check for the iframe marker and set a class to be used in later CSS as well.
	headComponents.push(<script dangerouslySetInnerHTML={{
		__html: `
(() => {
	var onContentLoaded = () => {
		var params = new URLSearchParams(document.location.search);
		var darkMode = false;
		if (params.get("dark")) {
			darkMode = params.get("dark") === "true";
		} else {
			var raw = localStorage.getItem("buddyFarmSettings");
			var settings = raw && JSON.parse(raw);
			darkMode = settings && settings.darkMode;
		}
		document.documentElement.classList[darkMode ? "add" : "remove"]("dark");
		params.get("iframe") === "true" && document.documentElement.classList.add("iframe");
	};
	document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', onContentLoaded) : onContentLoaded();
})();
		`,
	}} />)

	replaceHeadComponents(headComponents)
}

/** @type {import('gatsby').GatsbySSR['wrapRootElement']} */
export const wrapRootElement = Provider
