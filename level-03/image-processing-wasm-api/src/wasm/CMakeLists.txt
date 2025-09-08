cmake_minimum_required(VERSION 3.13)
project(image_processing_wasm)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

set(CMAKE_EXECUTABLE_SUFFIX ".wasm")

add_executable(image_processing image_processing.c)

set_target_properties(image_processing PROPERTIES LINK_FLAGS "-s WASM=1 -s EXPORTED_FUNCTIONS=['_grayscale','_blur','_edgeDetection','_adjustBrightness','_resizeImage','_malloc','_free'] -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap'] -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME='ImageProcessingModule' -s NO_EXIT_RUNTIME=1 -O3")
