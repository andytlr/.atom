{MotionWithInput} = require './general-motions'
{ViewModel} = require '../view-models/view-model'
{Point, Range} = require 'atom'

class Find extends MotionWithInput
  constructor: (@editorView, @vimState) ->
    super(@editorView, @vimState)
    @viewModel = new ViewModel(@, class: 'find', singleChar: true, hidden: true)
    @reversed = false
    @offset = 0

  match: (count) ->
    currentPosition = @editorView.editor.getCursorBufferPosition()
    line = @editorView.editor.lineForBufferRow(currentPosition.row)
    if @reversed
      index = currentPosition.column
      for i in [0..count-1]
        index = line.lastIndexOf(@input.characters, index-1)
      if index != -1
        point = new Point(currentPosition.row, index+@offset)
        return {} =
          point: point
          range: new Range(point, currentPosition)
    else
      index = currentPosition.column
      for i in [0..count-1]
        index = line.indexOf(@input.characters, index+1)
      if index != -1
        point = new Point(currentPosition.row, index-@offset)
        return {} =
          point: point
          range: new Range(currentPosition, point.translate([0,1]))

  reverse: ->
    @reversed = !@reversed
    @

  execute: (count=1) ->
    if (match = @match(count))?
      @editorView.editor.setCursorBufferPosition(match.point)

  select: (count=1, {requireEOL}={}) ->
    if (match = @match(count))?
      @editorView.editor.setSelectedBufferRange(match.range)
      return [true]
    [false]

class Till extends Find
  constructor: (@editorView, @vimState) ->
    super(@editorView, @vimState)
    @offset = 1

module.exports = {Find, Till}
