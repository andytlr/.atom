# react mock for tests

elements =
	div: true
	p: true

makeEl = (name) ->
	(children) -> type: name, children: children

module.exports =
	createClass: (cl) ->
		(props) -> type: cl, props: props

	renderComponent: (cls) ->
		component = Object.create cls.type
		component.props = cls.props
		console.log(component.render())

	DOM: do ->
		dom = {}
		for name, val of elements
			dom[name] = makeEl name
		dom
