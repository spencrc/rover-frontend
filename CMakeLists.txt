cmake_minimum_required(VERSION 3.1.6)
project(rover_frontend)

find_package(catkin REQUIRED)

catkin_package(
  CATKIN_DEPENDS rosbridge_server
)

include_directories(
  ${catkin_INCLUDE_DIRS}
)
