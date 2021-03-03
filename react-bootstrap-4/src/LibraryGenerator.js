// to run this script you must go through the following steps
// from the widget-library-generator project, run 'npm link'
// this will publish the widget-library-generator on your box
// then from this project, run 'npm link widget-library-generator'

import { PropTypes, TypeProperty, ValueSetProperty, WidgetLibraryGenerator } from 'widget-library-generator';
import { default as ReactBootstrap } from 'react-bootstrap';

const HELPERS = {
};

const projectDir = "project/";
const generator = new WidgetLibraryGenerator(projectDir, ReactBootstrap, HELPERS);
generator.generateLibrary("library/");