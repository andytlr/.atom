parse = require "regexp"

{Diagram, Sequence, Choice, Optional, OneOrMore, ZeroOrMore, Terminal,
 NonTerminal, Comment, Skip, Group } = require './railroad-diagrams'

rx2rr = (node, options) ->
  switch node.type
    when "match"
      literal = null
      sequence = []

      for n in node.body
        if n.type is "literal"
          if literal?
            literal += n.body
          else
            literal = n.body
        else
          if literal?
            sequence.push Terminal(literal)
            literal = null

          sequence.push rx2rr n

      if literal?
        sequence.push Terminal(literal)

      if sequence.length == 1
        sequence[0]
      else
        new Sequence sequence

    when "alternate"
      alternatives = []
      while node.type is "alternate"
        alternatives.push rx2rr node.left
        node = node.right

      alternatives.push rx2rr node

      new Choice Math.floor(alternatives.length/2)-1, alternatives

    when "quantified"
      {min, max} = node.quantifier

      body = rx2rr node.body

      switch min
        when 0
          if max is 1
            Optional(body)
          else
            if max != Infinity
              ZeroOrMore(body, Comment("0 to #{max} times"))
            else
              ZeroOrMore(body)
        when 1
          if max != Infinity
            OneOrMore(body, Comment("1 to #{max} times"))
          else
            OneOrMore(body)
        else
          if max != Infinity
            OneOrMore(body, Comment("#{min} to #{max} times"))
          else
            OneOrMore(body, Comment("at least #{min} times"))

    when "capture-group"
      Group rx2rr(node.body), Comment("capture #{node.index}")

    when "non-capture-group"
      Group rx2rr(node.body)

    when "positive-lookahead", "negative-lookahead", \
         "positive-lookbehind", "negative-lookbehind"
      Group rx2rr(node.body), Comment(node.type)

    when "back-reference"
      NonTerminal("ref #{node.index}")

    when "literal"
      if node.body == " "
        NonTerminal("SP")
      else
        Terminal(node.body)

    when "word"
      NonTerminal("word-character")

    when "non-word"
      NonTerminal("non-word-character")

    when "line-feed"
      NonTerminal("LF")

    when "carriage-return"
      NonTerminal("CR")

    when "form-feed"
      NonTerminal("FF")

    when "back-space"
      NonTerminal("BS")

    when "digit"
      Terminal("0-9")

    when "white-space"
      NonTerminal("WS")

    when "range"
      Terminal(node.text)

    when "charset"
      charset = (x.text for x in node.body)

      if charset.length == 1
        if node.invert
          return Terminal("not #{charset[0]}")
        else
          return Terminal(charset[0])
      else
        list = charset[0...-1].join(", ")
        if node.invert
          return Terminal("not #{list} and #{charset[-1..]}")
        else
          return Terminal("#{list} or #{charset[-1..]}")

    when "hex", "octal", "unicode"
      Terminal(node.text)

    else
      NonTerminal(node.type)

      # any-character
      # backspace
      # word-boundary
      # non-word-boundary
      # digit
      # non-digit
      # form-feed
      # line-feed
      # carriage-return
      # white-space
      # non-white-space
      # tab
      # vertical-tab
      # word
      # non-word
      # ! control-character (not supported)
      # octal \000
      # hex   \x...
      # unicode \u...
      # null-character

parseRegex = (regex) ->
  if regex instanceof RegExp
    regex = regex.source

  parse regex

module.exports =
  Regex2RailRoadDiagram: (regex, parent) ->
    Diagram(rx2rr(parseRegex(regex))).addTo(parent)

  ParseRegex: parseRegex
