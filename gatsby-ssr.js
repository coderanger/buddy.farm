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
	headComponents.push(<script dangerouslySetInnerHTML={{
		__html: `
(() => {
	var setDarkMode = () => {
		var raw = localStorage.getItem("buddyFarmSettings")
		var settings = raw && JSON.parse(raw)
		settings && document.documentElement.classList[settings.darkMode ? "add" : "remove"]("dark")
	}
	document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', setDarkMode) : setDarkMode()
})()
		`,
	}} />)

	replaceHeadComponents(headComponents)
}

/** @type {import('gatsby').GatsbySSR['wrapRootElement']} */
export const wrapRootElement = Provider
