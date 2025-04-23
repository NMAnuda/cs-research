(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/(All)/home/page.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Home)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Home() {
    _s();
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [vehicleNumber, setVehicleNumber] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [location, setLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        latitude: null,
        longitude: null
    });
    const [locationError, setLocationError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submissionMessage, setSubmissionMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(''); // For success/error messages
    const [city, setCity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // Store the city name from the response
    // Fetch current location on component mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition({
                    "Home.useEffect": (position)=>{
                        setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    }
                }["Home.useEffect"], {
                    "Home.useEffect": (error)=>{
                        console.error("Geolocation error:", error.code, error.message);
                        setLocationError(`Failed to get location: ${error.message} (Code: ${error.code})`);
                    }
                }["Home.useEffect"], {
                    timeout: 30000,
                    enableHighAccuracy: true,
                    maximumAge: 0
                });
            } else {
                setLocationError("Geolocation is not supported by this browser.");
            }
        }
    }["Home.useEffect"], []);
    const handleFileChange = (e)=>{
        const selected = e.target.files[0];
        setFile(selected);
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        console.log({
            file: file ? file.name : 'No file uploaded',
            vehicleNumber,
            location
        });
        const formData = new FormData();
        formData.append('vehicleNumber', vehicleNumber);
        if (file) {
            formData.append('photo', file);
        }
        formData.append('latitude', location.latitude || '');
        formData.append('longitude', location.longitude || '');
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('http://localhost:3080/submit-checkpoint', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 5000
            });
            console.log('Data submitted successfully to the database');
            setSubmissionMessage('Checkpoint submitted successfully!');
            setCity(response.data.city); // Store the city name from the response
        } catch (error) {
            console.error('Error submitting data to the database:', error);
            setSubmissionMessage('Failed to submit checkpoint. Please try again.');
        }
        setFile(null);
        setVehicleNumber('');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full bg-blue-50 flex items-center justify-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white shadow-md rounded-lg p-4 w-full max-w-lg sm:max-w-xl md:max-w-2xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-xl font-bold text-center text-blue-700 mb-4",
                    children: "Vehicle Checkpoint Form"
                }, void 0, false, {
                    fileName: "[project]/src/app/(All)/home/page.js",
                    lineNumber: 79,
                    columnNumber: 9
                }, this),
                submissionMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: `text-center text-sm mb-4 ${submissionMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`,
                    children: submissionMessage
                }, void 0, false, {
                    fileName: "[project]/src/app/(All)/home/page.js",
                    lineNumber: 84,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-md p-4 bg-blue-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "file-upload",
                                    className: "cursor-pointer text-blue-600 font-medium text-sm",
                                    children: [
                                        file ? file.name : "Click to capture or upload image or video",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "file-upload",
                                            type: "file",
                                            accept: "image/*,video/*",
                                            capture: "environment",
                                            className: "hidden",
                                            onChange: handleFileChange
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(All)/home/page.js",
                                            lineNumber: 96,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(All)/home/page.js",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this),
                                file && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-gray-500 mt-1",
                                    children: [
                                        "File selected: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: file.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(All)/home/page.js",
                                            lineNumber: 107,
                                            columnNumber: 32
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(All)/home/page.js",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(All)/home/page.js",
                            lineNumber: 90,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "vehicle-number",
                                    className: "block text-gray-700 font-medium text-sm mb-1",
                                    children: "Vehicle Number"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(All)/home/page.js",
                                    lineNumber: 113,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    id: "vehicle-number",
                                    type: "text",
                                    value: vehicleNumber,
                                    onChange: (e)=>setVehicleNumber(e.target.value),
                                    className: "w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:outline-none text-sm",
                                    placeholder: "e.g., ABC-1234",
                                    required: true
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(All)/home/page.js",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(All)/home/page.js",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-gray-700 font-medium text-sm mb-1",
                                    children: "Current Location (Optional)"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(All)/home/page.js",
                                    lineNumber: 131,
                                    columnNumber: 13
                                }, this),
                                locationError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-red-500 text-sm",
                                    children: [
                                        locationError,
                                        ". Please ensure location services are enabled on your device."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(All)/home/page.js",
                                    lineNumber: 135,
                                    columnNumber: 15
                                }, this) : location.latitude && location.longitude ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600 text-sm",
                                            children: [
                                                "Latitude: ",
                                                location.latitude,
                                                ", Longitude: ",
                                                location.longitude
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(All)/home/page.js",
                                            lineNumber: 140,
                                            columnNumber: 17
                                        }, this),
                                        city && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600 text-sm",
                                            children: [
                                                "City: ",
                                                city
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(All)/home/page.js",
                                            lineNumber: 144,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(All)/home/page.js",
                                    lineNumber: 139,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-500 text-sm",
                                    children: "Unable to fetch location"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(All)/home/page.js",
                                    lineNumber: 150,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(All)/home/page.js",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            className: "w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-all duration-200 text-sm",
                            children: "Submit"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(All)/home/page.js",
                            lineNumber: 154,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(All)/home/page.js",
                    lineNumber: 89,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(All)/home/page.js",
            lineNumber: 78,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(All)/home/page.js",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
_s(Home, "TYx7qIcbZjhmg00fApXjWCbtsyQ=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_%28All%29_home_page_20b8649e.js.map