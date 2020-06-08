// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const envVariables = {
  
  INSTANCE_URL: 'http://46.44.208.34:50400/API',
  DEVICE_NAME : "NO_DEVICE",
  DEVICE_ID : "",
  UID: "",
  VERSION: "0.1",
  BUILD: "10",
  USERNAME: "Test",
  SECONDS_FASE_1 : "000",
  SECONDS_FASE_2 : "000",
  TARGA: ""
};

export const environment = {
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
