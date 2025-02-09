import CodeMirror from "codemirror/lib/codemirror";
import PowiainaNum from "powiaina_num.js";
import Vue from "vue";

import "codemirror/addon/mode/simple";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/lint/lint";
import "codemirror/addon/selection/active-line";
import "codemirror/addon/edit/closebrackets";

window.CodeMirror = CodeMirror;
window.PowiainaNum = PowiainaNum;
window.Vue = Vue;
