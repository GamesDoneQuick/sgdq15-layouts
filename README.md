#sgdq15-layouts
This is a [NodeCG](http://github.com/nodecg/nodecg) bundle. You will need to have NodeCG installed to run it.

These are all the on-stream graphics used during Summer Games Done Quick 2015.

## Installation
- Install to `nodecg/bundles/sgdq15-layouts`

## Usage
This bundle is not intended to be used verbatim. Many of the assets have been replaced with placeholders, and
most of the data sources are hardcoded. We are open-sourcing this bundle in hopes that people will use it as a
learning tool and base to build from, rather than just taking and using it wholesale in their own productions.

To reiterate, please don't just download and use this bundle as-is. Build something new from it.

## Development
sgdq15-layouts has a `grunt` build process for the Less files used by the dashboard panels (`dashboard/src/**/*.less`).
These are the only files that must be re-built after any changes are made to them.
No other files in sgdq15-layouts require a build process.

To run `grunt` in the `sgdq15-layouts` folder, run the following commands from it:

```
$ npm install
$ grunt watch
```

Now, any changes made to the view Less files will trigger an automatic rebuild.

## Fonts
sgdq15-layouts relies on the following [TypeKit](https://typekit.com/) fonts and weights:

 - Tablet Gothic
  - Light
  - SemiBold
  - Bold
 - Tablet Gothic Condensed
  - Bold
 - Tablet Gothic Narrow
  - SemiBold Oblique
  - Bold
 - Tablet Gothic Wide
  - Bold
 - Tablet Gothic Semi Condensed
  - SemiBold Oblique

If you wish to access agdq15-layouts from anything other than `localhost`, you will need to make your own TypeKit with these fonts and whitelist the appropriate addresses.

## License
sgdq15-layouts is provided under the Apache v2 license, which is available to read in the [LICENSE][] file.
[license]: LICENSE

### Credits
Developed by [Support Class](http://supportclass.net/)
 - [Alex "Lange" Van Camp](http://alexvan.camp), developer  
 - [Matt McNamara](http://mattmcn.com), developer  
 - [Chris Hanel](http://chrishanel.com), designer
