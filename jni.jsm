var EXPORTED_SYMBOLS = ["JNI","android_log"];

Components.utils.import("resource://gre/modules/ctypes.jsm")

var liblog = ctypes.open('liblog.so');
var android_log = liblog.declare("__android_log_write",
                             ctypes.default_abi,
                             ctypes.int32_t,
                             ctypes.int32_t,
                             ctypes.char.ptr,
                             ctypes.char.ptr);

var libxul = ctypes.open('libxul.so');

var jenvptr = ctypes.voidptr_t;
var jclass = ctypes.voidptr_t;
var jobject = ctypes.voidptr_t;
var jvalue = ctypes.voidptr_t;
var jmethodid = ctypes.voidptr_t;
var jfieldid = ctypes.voidptr_t;

var jboolean = ctypes.uint8_t;
var jbyte = ctypes.int8_t;
var jchar = ctypes.uint16_t;
var jshort = ctypes.int16_t;
var jint = ctypes.int32_t;
var jlong = ctypes.int64_t;
var jfloat = ctypes.float32_t;
var jdouble = ctypes.float64_t;

var jsize = jint;
var jstring = jobject;
var jthrowable = jobject;

var JNINativeInterface = new ctypes.StructType(
    "JNINativeInterface",
    [{reserved0: ctypes.voidptr_t},
     {reserved1: ctypes.voidptr_t},
     {reserved2: ctypes.voidptr_t},
     {reserved3: ctypes.voidptr_t},
     {GetVersion: new ctypes.FunctionType(ctypes.default_abi,
                                          ctypes.int32_t,
                                          [ctypes.voidptr_t]).ptr},
     {DefineClass: ctypes.voidptr_t},
     {FindClass: new ctypes.FunctionType(ctypes.default_abi,
                                         jclass,
                                         [jenvptr,
                                          ctypes.char.ptr]).ptr},
     {FromReflectedMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                   jmethodid,
                                                   [jenvptr, jobject]).ptr},
     {FromReflectedField: new ctypes.FunctionType(ctypes.default_abi,
                                                  jfieldid,
                                                  [jenvptr, jobject]).ptr},
     {ToReflectedMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                 jobject,
                                                 [jenvptr, jclass,
                                                  jmethodid]).ptr},
     {GetSuperclass: new ctypes.FunctionType(ctypes.default_abi,
                                             jclass, [jenvptr, jclass]).ptr},
     {IsAssignableFrom: new ctypes.FunctionType(ctypes.default_abi,
                                                jboolean,
                                                [jenvptr, jclass, jclass]).ptr},
     {ToReflectedField: new ctypes.FunctionType(ctypes.default_abi,
                                                jobject,
                                                [jenvptr, jclass,
                                                 jfieldid]).ptr},
     {Throw: new ctypes.FunctionType(ctypes.default_abi,
                                     jint, [jenvptr, jthrowable]).ptr},
     {ThrowNew: new ctypes.FunctionType(ctypes.default_abi,
                                        jint, [jenvptr, jclass,
                                               ctypes.char.ptr]).ptr},
     {ExceptionOccurred: new ctypes.FunctionType(ctypes.default_abi,
                                                 jthrowable, [jenvptr]).ptr},
     {ExceptionDescribe: new ctypes.FunctionType(ctypes.default_abi,
                                                 ctypes.void_t, [jenvptr]).ptr},
     {ExceptionClear: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t, [jenvptr]).ptr},
     {FatalError: new ctypes.FunctionType(ctypes.default_abi,
                                          ctypes.void_t,
                                          [jenvptr,
                                           ctypes.char.ptr]).ptr},
     {PushLocalFrame: new ctypes.FunctionType(ctypes.default_abi,
                                              jint,
                                              [jenvptr, jint]).ptr},
     {PopLocalFrame: new ctypes.FunctionType(ctypes.default_abi,
                                             jobject,
                                             [jenvptr, jobject]).ptr},
     {NewGlobalRef: new ctypes.FunctionType(ctypes.default_abi,
                                            jobject, [jenvptr, jobject]).ptr},
     {DeleteGlobalRef: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr,
                                               jobject]).ptr},
     {DeleteLocalRef: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr,
                                               jobject]).ptr},
     {IsSameObject: new ctypes.FunctionType(ctypes.default_abi,
                                            jboolean,
                                            [jenvptr, jobject, jobject]).ptr},
     {NewLocalRef: new ctypes.FunctionType(ctypes.default_abi,
                                            jobject, [jenvptr, jobject]).ptr},
     {EnsureLocalCapacity: new ctypes.FunctionType(ctypes.default_abi,
                                                   jint, [jenvptr, jint]).ptr},
     {AllocObject: new ctypes.FunctionType(ctypes.default_abi,
                                           jobject, [jenvptr, jclass]).ptr},
     {NewObject: new ctypes.FunctionType(ctypes.default_abi,
                                         jobject,
                                         [jenvptr,
                                          jclass,
                                          jmethodid,
                                          "..."]).ptr},
     {NewObjectV: ctypes.voidptr_t},
     {NewObjectA: ctypes.voidptr_t},
     {GetObjectClass: new ctypes.FunctionType(ctypes.default_abi,
                                              jclass,
                                              [jenvptr, jobject]).ptr},
     {IsInstanceOf: new ctypes.FunctionType(ctypes.default_abi,
                                            jboolean,
                                            [jenvptr, jobject, jclass]).ptr},
     {GetMethodID: new ctypes.FunctionType(ctypes.default_abi,
                                           jmethodid,
                                           [jenvptr,
                                            jclass,
                                            ctypes.char.ptr,
                                            ctypes.char.ptr]).ptr},
     {CallObjectMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                jobject,
                                                [jenvptr, jobject, jmethodid,
                                                 "..."]).ptr},
     {CallObjectMethodV: ctypes.voidptr_t},
     {CallObjectMethodA: ctypes.voidptr_t},
     {CallBooleanMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                 jboolean,
                                                 [jenvptr,
                                                  jobject,
                                                  jmethodid,
                                                  "..."]).ptr},
     {CallBooleanMethodV: ctypes.voidptr_t},
     {CallBooleanMethodA: ctypes.voidptr_t},
     {CallByteMethod: new ctypes.FunctionType(ctypes.default_abi,
                                              jbyte,
                                              [jenvptr,
                                               jobject,
                                               jmethodid,
                                               "..."]).ptr},
     {CallByteMethodV: ctypes.voidptr_t},
     {CallByteMethodA: ctypes.voidptr_t},
     {CallCharMethod: new ctypes.FunctionType(ctypes.default_abi,
                                              jchar,
                                              [jenvptr,
                                               jobject,
                                               jmethodid,
                                               "..."]).ptr},
     {CallCharMethodV: ctypes.voidptr_t},
     {CallCharMethodA: ctypes.voidptr_t},
     {CallShortMethod: new ctypes.FunctionType(ctypes.default_abi,
                                               jshort,
                                               [jenvptr,
                                                jobject,
                                                jmethodid,
                                                "..."]).ptr},
     {CallShortMethodV: ctypes.voidptr_t},
     {CallShortMethodA: ctypes.voidptr_t},
     {CallIntMethod: new ctypes.FunctionType(ctypes.default_abi,
                                             jint,
                                             [jenvptr,
                                              jobject,
                                              jmethodid,
                                              "..."]).ptr},
     {CallIntMethodV: ctypes.voidptr_t},
     {CallIntMethodA: ctypes.voidptr_t},
     {CallLongMethod: new ctypes.FunctionType(ctypes.default_abi,
                                              jlong,
                                              [jenvptr,
                                               jobject,
                                               jmethodid,
                                               "..."]).ptr},
     {CallLongMethodV: ctypes.voidptr_t},
     {CallLongMethodA: ctypes.voidptr_t},
     {CallFloatMethod: new ctypes.FunctionType(ctypes.default_abi,
                                               jfloat,
                                               [jenvptr,
                                                jobject,
                                                jmethodid,
                                                "..."]).ptr},
     {CallFloatMethodV: ctypes.voidptr_t},
     {CallFloatMethodA: ctypes.voidptr_t},
     {CallDoubleMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                jdouble,
                                                [jenvptr,
                                                 jobject,
                                                 jmethodid,
                                                 "..."]).ptr},
     {CallDoubleMethodV: ctypes.voidptr_t},
     {CallDoubleMethodA: ctypes.voidptr_t},
     {CallVoidMethod: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr,
                                               jobject,
                                               jmethodid,
                                               "..."]).ptr},
     {CallVoidMethodV: ctypes.voidptr_t},
     {CallVoidMethodA: ctypes.voidptr_t},
     {CallNonvirtualObjectMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                          jobject,
                                                          [jenvptr, jobject,
                                                           jclass, jmethodid,
                                                           "..."]).ptr},
     {CallNonvirtualObjectMethodV: ctypes.voidptr_t},
     {CallNonvirtualObjectMethodA: ctypes.voidptr_t},
     {CallNonvirtualBooleanMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                           jboolean,
                                                           [jenvptr, jobject,
                                                            jclass, jmethodid,
                                                            "..."]).ptr},
     {CallNonvirtualBooleanMethodV: ctypes.voidptr_t},
     {CallNonvirtualBooleanMethodA: ctypes.voidptr_t},
     {CallNonvirtualByteMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                        jbyte,
                                                        [jenvptr, jobject,
                                                         jclass, jmethodid,
                                                         "..."]).ptr},
     {CallNonvirtualByteMethodV: ctypes.voidptr_t},
     {CallNonvirtualByteMethodA: ctypes.voidptr_t},
     {CallNonvirtualCharMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                        jchar,
                                                        [jenvptr, jobject,
                                                         jclass, jmethodid,
                                                         "..."]).ptr},
     {CallNonvirtualCharMethodV: ctypes.voidptr_t},
     {CallNonvirtualCharMethodA: ctypes.voidptr_t},
     {CallNonvirtualShortMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                         jshort,
                                                         [jenvptr, jobject,
                                                          jclass, jmethodid,
                                                          "..."]).ptr},
     {CallNonvirtualShortMethodV: ctypes.voidptr_t},
     {CallNonvirtualShortMethodA: ctypes.voidptr_t},
     {CallNonvirtualIntMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                       jint,
                                                       [jenvptr, jobject,
                                                        jclass, jmethodid,
                                                        "..."]).ptr},
     {CallNonvirtualIntMethodV: ctypes.voidptr_t},
     {CallNonvirtualIntMethodA: ctypes.voidptr_t},
     {CallNonvirtualLongMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                        jlong,
                                                        [jenvptr, jobject,
                                                         jclass, jmethodid,
                                                         "..."]).ptr},
     {CallNonvirtualLongMethodV: ctypes.voidptr_t},
     {CallNonvirtualLongMethodA: ctypes.voidptr_t},
     {CallNonvirtualFloatMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                         jfloat,
                                                         [jenvptr, jobject,
                                                          jclass, jmethodid,
                                                          "..."]).ptr},
     {CallNonvirtualFloatMethodV: ctypes.voidptr_t},
     {CallNonvirtualFloatMethodA: ctypes.voidptr_t},
     {CallNonvirtualDoubleMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                          jdouble,
                                                          [jenvptr, jobject,
                                                           jclass, jmethodid,
                                                           "..."]).ptr},
     {CallNonvirtualDoubleMethodV: ctypes.voidptr_t},
     {CallNonvirtualDoubleMethodA: ctypes.voidptr_t},
     {CallNonvirtualVoidMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                        ctypes.void_t,
                                                        [jenvptr, jobject,
                                                         jclass, jmethodid,
                                                         "..."]).ptr},
     {CallNonvirtualVoidMethodV: ctypes.voidptr_t},
     {CallNonvirtualVoidMethodA: ctypes.voidptr_t},
     {GetFieldID: new ctypes.FunctionType(ctypes.default_abi,
                                          jfieldid,
                                          [jenvptr, jclass,
                                           ctypes.char.ptr,
                                           ctypes.char.ptr]).ptr},
     {GetObjectField: new ctypes.FunctionType(ctypes.default_abi,
                                              jobject,
                                              [jenvptr, jobject,
                                               jfieldid]).ptr},
     {GetBooleanField: new ctypes.FunctionType(ctypes.default_abi,
                                               jboolean,
                                               [jenvptr, jobject,
                                                jfieldid]).ptr},
     {GetByteField: new ctypes.FunctionType(ctypes.default_abi,
                                            jbyte,
                                            [jenvptr, jobject,
                                             jfieldid]).ptr},
     {GetCharField: new ctypes.FunctionType(ctypes.default_abi,
                                            jchar,
                                            [jenvptr, jobject,
                                             jfieldid]).ptr},
     {GetShortField: new ctypes.FunctionType(ctypes.default_abi,
                                             jshort,
                                             [jenvptr, jobject,
                                              jfieldid]).ptr},
     {GetIntField: new ctypes.FunctionType(ctypes.default_abi,
                                           jint,
                                           [jenvptr, jobject,
                                            jfieldid]).ptr},
     {GetLongField: new ctypes.FunctionType(ctypes.default_abi,
                                            jlong,
                                            [jenvptr, jobject,
                                             jfieldid]).ptr},
     {GetFloatField: new ctypes.FunctionType(ctypes.default_abi,
                                             jfloat,
                                             [jenvptr, jobject,
                                              jfieldid]).ptr},
     {GetDoubleField: new ctypes.FunctionType(ctypes.default_abi,
                                              jdouble,
                                              [jenvptr, jobject,
                                               jfieldid]).ptr},
     {SetObjectField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jobject]).ptr},
     {SetBooleanField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jboolean]).ptr},
     {SetByteField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jbyte]).ptr},
     {SetCharField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jchar]).ptr},
     {SetShortField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jshort]).ptr},
     {SetIntField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jint]).ptr},
     {SetLongField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jlong]).ptr},
     {SetFloatField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jfloat]).ptr},
     {SetDoubleField: new ctypes.FunctionType(ctypes.default_abi,
                                              ctypes.void_t,
                                              [jenvptr, jobject,
                                               jfieldid, jdouble]).ptr},
     {GetStaticMethodID: new ctypes.FunctionType(ctypes.default_abi,
                                           jmethodid,
                                           [jenvptr,
                                            jclass,
                                            ctypes.char.ptr,
                                            ctypes.char.ptr]).ptr},
     {CallStaticObjectMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                      jobject,
                                                      [jenvptr, jclass,
                                                       jmethodid,
                                                       "..."]).ptr},
     {CallStaticObjectMethodV: ctypes.voidptr_t},
     {CallStaticObjectMethodA: ctypes.voidptr_t},
     {CallStaticBooleanMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                       jboolean,
                                                       [jenvptr, jclass,
                                                        jmethodid,
                                                        "..."]).ptr},
     {CallStaticBooleanMethodV: ctypes.voidptr_t},
     {CallStaticBooleanMethodA: ctypes.voidptr_t},
     {CallStaticByteMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                    jbyte,
                                                    [jenvptr, jclass,
                                                     jmethodid,
                                                     "..."]).ptr},
     {CallStaticByteMethodV: ctypes.voidptr_t},
     {CallStaticByteMethodA: ctypes.voidptr_t},
     {CallStaticCharMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                    jchar,
                                                    [jenvptr, jclass,
                                                     jmethodid,
                                                     "..."]).ptr},
     {CallStaticCharMethodV: ctypes.voidptr_t},
     {CallStaticCharMethodA: ctypes.voidptr_t},
     {CallStaticShortMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                     jshort,
                                                     [jenvptr, jclass,
                                                      jmethodid,
                                                      "..."]).ptr},
     {CallStaticShortMethodV: ctypes.voidptr_t},
     {CallStaticShortMethodA: ctypes.voidptr_t},
     {CallStaticIntMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                   jint,
                                                   [jenvptr, jclass,
                                                    jmethodid,
                                                    "..."]).ptr},
     {CallStaticIntMethodV: ctypes.voidptr_t},
     {CallStaticIntMethodA: ctypes.voidptr_t},
     {CallStaticLongMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                    jlong,
                                                    [jenvptr, jclass,
                                                     jmethodid,
                                                     "..."]).ptr},
     {CallStaticLongMethodV: ctypes.voidptr_t},
     {CallStaticLongMethodA: ctypes.voidptr_t},
     {CallStaticFloatMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                     jfloat,
                                                     [jenvptr, jclass,
                                                      jmethodid,
                                                      "..."]).ptr},
     {CallStaticFloatMethodV: ctypes.voidptr_t},
     {CallStaticFloatMethodA: ctypes.voidptr_t},
     {CallStaticDoubleMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                      jdouble,
                                                      [jenvptr, jclass,
                                                       jmethodid,
                                                       "..."]).ptr},
     {CallStaticDoubleMethodV: ctypes.voidptr_t},
     {CallStaticDoubleMethodA: ctypes.voidptr_t},
     {CallStaticVoidMethod: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jmethodid,
                                                     "..."]).ptr},
     {CallStaticVoidMethodV: ctypes.voidptr_t},
     {CallStaticVoidMethodA: ctypes.voidptr_t},
     {GetStaticFieldID: new ctypes.FunctionType(ctypes.default_abi,
                                                jfieldid,
                                                [jenvptr, jclass,
                                                 ctypes.char.ptr,
                                                 ctypes.char.ptr]).ptr},
     {GetStaticObjectField: new ctypes.FunctionType(ctypes.default_abi,
                                                    jobject,
                                                    [jenvptr, jclass,
                                                     jfieldid]).ptr},
     {GetStaticBooleanField: new ctypes.FunctionType(ctypes.default_abi,
                                                     jboolean,
                                                     [jenvptr, jclass,
                                                      jfieldid]).ptr},
     {GetStaticByteField: new ctypes.FunctionType(ctypes.default_abi,
                                                  jbyte,
                                                  [jenvptr, jclass,
                                                   jfieldid]).ptr},
     {GetStaticCharField: new ctypes.FunctionType(ctypes.default_abi,
                                                  jchar,
                                                  [jenvptr, jclass,
                                                   jfieldid]).ptr},
     {GetStaticShortField: new ctypes.FunctionType(ctypes.default_abi,
                                                   jshort,
                                                   [jenvptr, jclass,
                                                    jfieldid]).ptr},
     {GetStaticIntField: new ctypes.FunctionType(ctypes.default_abi,
                                                 jint,
                                                 [jenvptr, jclass,
                                                  jfieldid]).ptr},
     {GetStaticLongField: new ctypes.FunctionType(ctypes.default_abi,
                                                  jlong,
                                                  [jenvptr, jclass,
                                                   jfieldid]).ptr},
     {GetStaticFloatField: new ctypes.FunctionType(ctypes.default_abi,
                                                   jfloat,
                                                   [jenvptr, jclass,
                                                    jfieldid]).ptr},
     {GetStaticDoubleField: new ctypes.FunctionType(ctypes.default_abi,
                                                    jdouble,
                                                    [jenvptr, jclass,
                                                     jfieldid]).ptr},
     {SetStaticObjectField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jobject]).ptr},
     {SetStaticBooleanField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jboolean]).ptr},
     {SetStaticByteField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jbyte]).ptr},
     {SetStaticCharField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jchar]).ptr},
     {SetStaticShortField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jshort]).ptr},
     {SetStaticIntField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jint]).ptr},
     {SetStaticLongField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jlong]).ptr},
     {SetStaticFloatField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jfloat]).ptr},
     {SetStaticDoubleField: new ctypes.FunctionType(ctypes.default_abi,
                                                    ctypes.void_t,
                                                    [jenvptr, jclass,
                                                     jfieldid, jdouble]).ptr},

     {NewString: new ctypes.FunctionType(ctypes.default_abi,
                                         jstring,
                                         [jenvptr, jchar.ptr, jsize]).ptr},
     {GetStringLength: new ctypes.FunctionType(ctypes.default_abi,
                                               jsize,
                                               [jenvptr, jstring]).ptr},
     {GetStringChars: new ctypes.FunctionType(ctypes.default_abi,
                                              jchar.ptr,
                                              [jenvptr, jstring,
                                               jboolean.ptr]).ptr},
     {ReleaseStringChars: new ctypes.FunctionType(ctypes.default_abi,
                                                  ctypes.void_t,
                                                  [jenvptr, jstring,
                                                   jchar.ptr]).ptr},

     {NewStringUTF: new ctypes.FunctionType(ctypes.default_abi,
                                            jstring,
                                            [jenvptr,
                                             ctypes.char.ptr]).ptr},
     {GetStringUTFLength: new ctypes.FunctionType(ctypes.default_abi,
                                                  jsize,
                                                  [jenvptr, jstring]).ptr},
     {GetStringUTFChars: new ctypes.FunctionType(ctypes.default_abi,
                                                 ctypes.char.ptr,
                                                 [jenvptr, jstring,
                                                  jboolean.ptr]).ptr},
     {ReleaseStringUTFChars: new ctypes.FunctionType(ctypes.default_abi,
                                                     ctypes.void_t,
                                                     [jenvptr, jstring,
                                                      ctypes.char.ptr]).ptr},
     {GetArrayLength: ctypes.voidptr_t},
     {NewObjectArray: ctypes.voidptr_t},
     {GetObjectArrayElement: ctypes.voidptr_t},
     {SetObjectArrayElement: ctypes.voidptr_t},
     {NewBooleanArray: ctypes.voidptr_t},
     {NewByteArray: ctypes.voidptr_t},
     {NewCharArray: ctypes.voidptr_t},
     {NewShortArray: ctypes.voidptr_t},
     {NewIntArray: ctypes.voidptr_t},
     {NewLongArray: ctypes.voidptr_t},
     {NewFloatArray: ctypes.voidptr_t},
     {NewDoubleArray: ctypes.voidptr_t},
     {GetBooleanArrayElements: ctypes.voidptr_t},
     {GetByteArrayElements: ctypes.voidptr_t},
     {GetCharArrayElements: ctypes.voidptr_t},
     {GetShortArrayElements: ctypes.voidptr_t},
     {GetIntArrayElements: ctypes.voidptr_t},
     {GetLongArrayElements: ctypes.voidptr_t},
     {GetFloatArrayElements: ctypes.voidptr_t},
     {GetDoubleArrayElements: ctypes.voidptr_t},
     {ReleaseBooleanArrayElements: ctypes.voidptr_t},
     {ReleaseByteArrayElements: ctypes.voidptr_t},
     {ReleaseCharArrayElements: ctypes.voidptr_t},
     {ReleaseShortArrayElements: ctypes.voidptr_t},
     {ReleaseIntArrayElements: ctypes.voidptr_t},
     {ReleaseLongArrayElements: ctypes.voidptr_t},
     {ReleaseFloatArrayElements: ctypes.voidptr_t},
     {ReleaseDoubleArrayElements: ctypes.voidptr_t},
     {GetBooleanArrayRegion: ctypes.voidptr_t},
     {GetByteArrayRegion: ctypes.voidptr_t},
     {GetCharArrayRegion: ctypes.voidptr_t},
     {GetShortArrayRegion: ctypes.voidptr_t},
     {GetIntArrayRegion: ctypes.voidptr_t},
     {GetLongArrayRegion: ctypes.voidptr_t},
     {GetFloatArrayRegion: ctypes.voidptr_t},
     {GetDoubleArrayRegion: ctypes.voidptr_t},
     {SetBooleanArrayRegion: ctypes.voidptr_t},
     {SetByteArrayRegion: ctypes.voidptr_t},
     {SetCharArrayRegion: ctypes.voidptr_t},
     {SetShortArrayRegion: ctypes.voidptr_t},
     {SetIntArrayRegion: ctypes.voidptr_t},
     {SetLongArrayRegion: ctypes.voidptr_t},
     {SetFloatArrayRegion: ctypes.voidptr_t},
     {SetDoubleArrayRegion: ctypes.voidptr_t},
     {RegisterNatives: ctypes.voidptr_t},
     {UnregisterNatives: ctypes.voidptr_t},
     {MonitorEnter: new ctypes.FunctionType(ctypes.default_abi,
                                            jint, [jenvptr, jobject]).ptr},
     {MonitorExit: new ctypes.FunctionType(ctypes.default_abi,
                                            jint, [jenvptr, jobject]).ptr},
     {GetJavaVM: ctypes.voidptr_t},
     {GetStringRegion: ctypes.voidptr_t},
     {GetStringUTFRegion: ctypes.voidptr_t},
     {GetPrimitiveArrayCritical: ctypes.voidptr_t},
     {ReleasePrimitiveArrayCritical: ctypes.voidptr_t},
     {GetStringCritical: ctypes.voidptr_t},
     {ReleaseStringCritical: ctypes.voidptr_t},
     {NewWeakGlobalRef: ctypes.voidptr_t},
     {DeleteWeakGlobalRef: ctypes.voidptr_t},
     {ExceptionCheck: new ctypes.FunctionType(ctypes.default_abi,
                                              jboolean, [jenvptr]).ptr},
     {NewDirectByteBuffer: ctypes.voidptr_t},
     {GetDirectBufferAddress: ctypes.voidptr_t},
     {GetDirectBufferCapacity: ctypes.voidptr_t},
     {GetObjectRefType: ctypes.voidptr_t}]
);

var GetJNIForThread = libxul.declare("GetJNIForThread",
                                     ctypes.default_abi,
                                     JNINativeInterface.ptr.ptr);

var registry = Object.create(null);
var classes = Object.create(null);

function JNIUnloadClasses(jenv) {
  Object.getOwnPropertyNames(registry).forEach(function(classname) {
    var jcls = unwrap(registry[classname]);
    jenv.contents.contents.DeleteGlobalRef(jenv, jcls);
  });
}

var PREFIX = 'js#';
// this regex matches one component of a type signature:
// any number of array modifiers, followed by either a
// primitive type character or L<classname>;
var sigRegex = function() /\[*([VZBCSIJFD]|L([^.\/;]+(\/[^.\/;]+)*);)/;
var ensureSig = function(classname_or_signature) {
    // convert a classname into a signature,
    // leaving unchanged signatures.  We assume that
    // anything not a valid signature is a classname.
  var m = sigRegex().exec(classname_or_signature);
  return (m && m[0] === classname_or_signature) ? classname_or_signature :
    'L' + classname_or_signature.replace(/\./g, '/') + ';';
};
var wrap = function(obj, classSig) {
  if (!classSig) { return obj; }
  // don't wrap primitive types.
  if (classSig.charAt(0)!=='L' &&
      classSig.charAt(0)!=='[') { return obj; }
  var proto = registry[classSig][PREFIX+'proto'];
  return new proto(obj);
};
var unwrap = function(obj) {
  if (obj && typeof(obj)==='object' && (PREFIX+'obj') in obj) {
    return obj[PREFIX+'obj'];
  }
  return obj;
};
var ensureLoaded = function(jenv, classSig) {
  if (!Object.hasOwnProperty.call(registry, classSig)) {
    JNILoadClass(jenv, classSig, {});
  }
  return registry[classSig];
};

function JNINewString(jenv, value) {
  var s = jenv.contents.contents.NewStringUTF(jenv, ctypes.char.array()(value));
  ensureLoaded(jenv, "Ljava/lang/String;");
  return wrap(s, "Ljava/lang/String;");
}

function JNIReadString(jenv, jstring_value) {
  var val = unwrap(jstring_value);
  if ((!val) || val.isNull()) { return null; }
  var chars = jenv.contents.contents.GetStringUTFChars(jenv, val, null);
  var result = chars.readString();
  jenv.contents.contents.ReleaseStringUTFChars(jenv, val, chars);
  return result;
}

// return the class object for a signature string.
// allocates 1 or 2 local refs
function JNIClassObj(jenv, classSig) {
    var jenvpp = function() { return jenv.contents.contents; };
    // Deal with funny calling convention of JNI FindClass method.
    // Classes get the leading & trailing chars stripped; primitives
    // have to be looked up via their wrapper type.
    var prim = function(ty) {
        var jcls = jenvpp().FindClass(jenv, "java/lang/"+ty);
        var jfld = jenvpp().GetStaticFieldID(jenv, jcls, "TYPE",
                                             "Ljava/lang/Class;");
        return jenvpp().GetStaticObjectField(jenv, jcls, jfld);
    };
    switch (classSig.charAt(0)) {
    case '[':
        return jenvpp().FindClass(jenv, classSig);
    case 'L':
        classSig = classSig.substring(1, classSig.indexOf(';'));
        return jenvpp().FindClass(jenv, classSig);
    case 'V': return prim('Void');
    case 'Z': return prim('Boolean');
    case 'B': return prim('Byte');
    case 'C': return prim('Char');
    case 'S': return prim('Short');
    case 'I': return prim('Integer');
    case 'J': return prim('Long');
    case 'F': return prim('Float');
    case 'D': return prim('Double');
    }
    throw new Error("invalid signature");
}

// return the signature string for a Class object.
// allocates 2 local refs
function JNIClassSig(jenv, jcls) {
  var jenvpp = function() { return jenv.contents.contents; };
  var jclscls = jenvpp().FindClass(jenv, "java/lang/Class");
  var jmtd = jenvpp().GetMethodID(jenv, jclscls,
                                  "getName", "()Ljava/lang/String;");
  var name = jenvpp().CallObjectMethod(jenv, jcls, jmtd);
  name = JNIReadString(jenv, name);
  // API is weird.  Make sure we're using slashes not dots
  name = name.replace(/\./g, '/');
  // special case primitives, arrays
  if (name.charAt(0)==='[') return name;
  switch(name) {
  case 'void': return 'V';
  case 'boolean': return 'Z';
  case 'byte': return 'B';
  case 'char': return 'C';
  case 'short': return 'S';
  case 'int': return 'I';
  case 'long': return 'J';
  case 'float': return 'F';
  case 'double': return 'D';
  default:
    return 'L' + name + ';';
  }
}

// Create appropriate wrapper fields/methods for a Java class.
function JNILoadClass(jenv, classSig, props) {
  var sigTypes = {
    V: "Void", Z: "Boolean", B: "Byte", C: "Char", S: "Short",
    I: "Int", J: "Long", F: "Float", D: "Double", L: "Object", "[": "Object"
  };
  var sig2type = function(sig) { return sigTypes[sig.charAt(0)]; };

  var jenvpp = function() { return jenv.contents.contents; };

  // allocate a local reference frame with enough space
  var numLocals = 5; // this class (1 or 2 local refs) and superclass (3 refs)
  jenvpp().PushLocalFrame(jenv, numLocals);

  var jcls;
  if (Object.hasOwnProperty.call(registry, classSig)) {
    jcls = unwrap(registry[classSig]);
  } else {
    jcls = jenvpp().NewGlobalRef(jenv, JNIClassObj(jenv, classSig));

    // get name of superclass
    var jsuper = jenvpp().GetSuperclass(jenv, jcls);
    if (jsuper.isNull()) {
      jsuper = null;
    } else {
      jsuper = JNIClassSig(jenv, jsuper);
    }

    registry[classSig] = Object.create(jsuper?ensureLoaded(jenv, jsuper):null);
    registry[classSig][PREFIX+'obj'] = jcls; // global ref, persistent.
    registry[classSig][PREFIX+'proto'] =
      function(o) { this[PREFIX+'obj'] = o; };
    registry[classSig][PREFIX+'proto'].prototype =
      Object.create(jsuper ? ensureLoaded(jenv, jsuper)[PREFIX+'proto'].prototype :
                    null);
    // Add a __cast__ method to the wrapper corresponding to the class
    registry[classSig].__cast__ = function(obj) {
      return wrap(unwrap(obj), classSig);
    };

    // make wrapper accessible via the classes object.
    var path = sig2type(classSig).toLowerCase();
    if (classSig.charAt(0)==='L') {
      path = classSig.substring(1, classSig.length-1);
    }
    if (classSig.charAt(0)!=='[') {
      var root = classes, i;
      var parts = path.split('/');
      for (i = 0; i < parts.length-1; i++) {
        if (!Object.hasOwnProperty.call(root, parts[i])) {
          root[parts[i]] = Object.create(null);
        }
        root = root[parts[i]];
      }
      root[parts[parts.length-1]] = registry[classSig];
    }
  }

  var r = registry[classSig];
  var rpp = r[PREFIX+'proto'].prototype;

  if (classSig.charAt(0)==='[') {
    // XXX add 'length' field, 'get' and 'set' methods, 'new' constructor
  }

  // XXX should cast method arguments to proper primitive types using signature

  (props.static_fields || []).forEach(function(fld) {
    var jfld = jenvpp().GetStaticFieldID(jenv, jcls, fld.name, fld.sig);
    var ty = sig2type(fld.sig), nm = fld.sig;
    var getter = "GetStatic"+ty+"Field", setter = "SetStatic"+ty+"Field";
    ensureLoaded(jenv, nm);
    var props =  {
      get: function() {
        var j = jenvpp();
        return wrap(j[getter].call(j, jenv, jcls, jfld), nm);
      },
      set: function(newValue) {
        var j = jenvpp();
        j[setter].call(j, jenv, jcls, jfld, unwrap(newValue));
      }
    };
    Object.defineProperty(r, fld.name, props);
    // add static fields to object instances, too.
    Object.defineProperty(rpp, fld.name, props);
  });
  (props.static_methods || []).forEach(function(mtd) {
    var jmtd = jenvpp().GetStaticMethodID(jenv, jcls, mtd.name, mtd.sig);
    var returnSig = mtd.sig.substring(mtd.sig.indexOf(')')+1);
    var ty = sig2type(returnSig), nm = returnSig;
    var call = "CallStatic"+ty+"Method";
    ensureLoaded(jenv, nm);
    r[mtd.name] = r[mtd.name + mtd.sig] =
    // add static methods to object instances, too.
    rpp[mtd.name] = rpp[mtd.name + mtd.sig] = function() {
      var i, j = jenvpp();
      var args = [jenv, jcls, jmtd];
      for (i=0; i<arguments.length; i++) {
        args.push(unwrap(arguments[i]));
      }
      return wrap(j[call].apply(j, args), nm);
    };
  });
  (props.constructors || []).forEach(function(mtd) {
    mtd.name = "<init>";
    var jmtd = jenvpp().GetMethodID(jenv, jcls, mtd.name, mtd.sig);
    var returnSig = mtd.sig.substring(mtd.sig.indexOf(')')+1);
    r['new'] = r['new'+mtd.sig] = r[mtd.name + mtd.sig] = function() {
      var i, j = jenvpp();
      var args = [jenv, jcls, jmtd];
      for (i=0; i<arguments.length; i++) {
        args.push(unwrap(arguments[i]));
      }
      return wrap(j.NewObject.apply(j, args), classSig);
    };
  });
  (props.fields || []).forEach(function(fld) {
    var jfld = jenvpp().GetFieldID(jenv, jcls, fld.name, fld.sig);
    var ty = sig2type(fld.sig), nm = fld.sig;
    var getter = "Get"+ty+"Field", setter = "Set"+ty+"Field";
    ensureLoaded(jenv, nm);
    Object.defineProperty(rpp, fld.name, {
      get: function() {
        var j = jenvpp();
        return wrap(j[getter].call(j, jenv, unwrap(this), jfld), nm);
      },
      set: function(newValue) {
        var j = jenvpp();
        j[setter].call(j, jenv, unwrap(this), jfld, unwrap(newValue));
      }
    });
  });
  (props.methods || []).forEach(function(mtd) {
    var jmtd = jenvpp().GetMethodID(jenv, jcls, mtd.name, mtd.sig);
    var returnSig = mtd.sig.substring(mtd.sig.indexOf(')')+1);
    var ty = sig2type(returnSig), nm = returnSig;
    var call = "Call"+ty+"Method";
    ensureLoaded(jenv, nm);
    rpp[mtd.name] = rpp[mtd.name + mtd.sig] = function() {
      var i, j = jenvpp();
      var args = [jenv, unwrap(this), jmtd];
      for (i=0; i<arguments.length; i++) {
        args.push(unwrap(arguments[i]));
      }
      return wrap(j[call].apply(j, args), nm);
    };
  });
  jenvpp().PopLocalFrame(jenv, null);
  return r;
}

// exported object
var JNI = {
  // primitive types
  jboolean: jboolean,
  jbyte: jbyte,
  jchar: jchar,
  jshort: jshort,
  jint: jint,
  jlong: jlong,
  jfloat: jfloat,
  jdouble: jdouble,
  jsize: jsize,

  // class registry
  classes: classes,

  // methods
  GetForThread: GetJNIForThread,
  NewString: JNINewString,
  ReadString: JNIReadString,
  LoadClass: function(jenv, classname_or_signature, props) {
    return JNILoadClass(jenv, ensureSig(classname_or_signature), props);
  },
  UnloadClasses: JNIUnloadClasses
};
