/* Management Magic for Google Analytics
*    Auxiliary functions for dimension management
*
* Copyright ©2015 Pedro Avila (pdro@google.com)
***************************************************************************/

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    } else return true;
}