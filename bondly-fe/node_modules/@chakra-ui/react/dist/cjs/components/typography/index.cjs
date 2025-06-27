"use strict";
'use strict';

var heading = require('./heading.cjs');
var text = require('./text.cjs');
var em = require('./em.cjs');
var strong = require('./strong.cjs');
var mark = require('./mark.cjs');
var quote = require('./quote.cjs');



exports.Heading = heading.Heading;
exports.HeadingPropsProvider = heading.HeadingPropsProvider;
exports.Text = text.Text;
exports.TextPropsProvider = text.TextPropsProvider;
exports.Em = em.Em;
exports.Strong = strong.Strong;
exports.Mark = mark.Mark;
exports.MarkPropsProvider = mark.MarkPropsProvider;
exports.Quote = quote.Quote;
