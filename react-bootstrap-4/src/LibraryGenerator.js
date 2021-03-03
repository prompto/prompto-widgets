// to run this script you must go through the following steps
// from the widget-library-generator project, run 'npm link'
// this will publish the widget-library-generator package on your box
// from the react-bootstrap project, use the 'do-not-strip-prototypes' branch, then run 'npm link' (also uses a different package name)
// this will publish the patched react-bootstrap package on your box
// then from this project, run 'npm link widget-library-generator react-bootstrap'

import { PropTypes, TypeProperty, ValueSetProperty, WidgetLibraryGenerator } from 'widget-library-generator';
import { default as ReactBootstrap } from 'react-bootstrap-4';

const HELPERS = {
};

const projectDir = "project/";
const generator = new WidgetLibraryGenerator(projectDir, ReactBootstrap, HELPERS);
generator.generateLibrary("library/");