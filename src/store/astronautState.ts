import { Vector3 } from "three";

// Astronaut ও CameraRig-এর মধ্যে শেয়ার্ড, non-reactive state
export const astronautState = {
  position: new Vector3(0, 0, 0),
  velocity: new Vector3(0, 0, 0),
};