cmake_minimum_required(VERSION 3.1.6)
project(rover_frontend)

file(DOWNLOAD https://cdnjs.cloudflare.com/ajax/libs/roslibjs/1.1.0/roslib.min.js ./static/js/roslib.min.js
  SHOW_PROGRESS
  EXPECTED_HASH SHA512=c763b073d59ac917118fcd199e46aee7cb2155f5cdd8e217fa040096bc7a28fba06412ab202e80c20116410088d3aa7643c441e229710fecbed4174d77ed5f40
  TLS_VERIFY ON
)

find_package(catkin REQUIRED)

catkin_package(
  CATKIN_DEPENDS rosbridge_server
)

include_directories(
  ${catkin_INCLUDE_DIRS}
)
