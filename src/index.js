'use strict';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import jQuery from 'jquery';
import 'bootstrap/js/dist/collapse';
import 'bootstrap';
import './style.css';
import printMe from './print';

printMe();

window.$ = $;
window.jQuery = $;

console.log($('.starter-template').html());

