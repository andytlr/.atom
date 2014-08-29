React = require './react'
document = require './dom'

RadComponent = require './rad-component'

React.renderComponent RadComponent(rad: 'mos def'),
	document.getElementById 'container'
