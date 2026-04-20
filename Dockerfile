FROM ros:noetic-ros-base

LABEL maintainer="spencrc <145073726+spencrc@users.noreply.github.com>"
# Prevent interactive prompts during apt installations
ENV DEBIAN_FRONTEND=noninteractive

# Create the catkin workspace directory
RUN mkdir -p /catkin_ws/src
WORKDIR /catkin_ws

# Copy source code
COPY . src/rover_frontend/

# Install dependencies listed in package.xml for all packages in the src 
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && \
    rosdep update --include-eol-distros && \
    rosdep install --from-paths src --ignore-src -r -y && \
    rm -rf /var/lib/apt/lists/*

# Build the catkin workspace
RUN /bin/bash -c "source /opt/ros/noetic/setup.bash && catkin_make"

CMD ["/bin/bash", "-c", "source /catkin_ws/devel/setup.bash && bash"]