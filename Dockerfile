FROM ros:noetic-ros-base

RUN mkdir -p /catkin_ws/src
WORKDIR /catkin_ws
COPY . .
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && \
    rosdep update --include-eol-distros && \
    rosdep install --from-paths . --ignore-src -y

RUN /bin/bash -c "source /opt/ros/noetic/setup.bash && catkin_make"

CMD ["/bin/bash", "-c", "source /catkin_ws/devel/setup.bash && bash"]