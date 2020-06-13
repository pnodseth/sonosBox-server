import mongoose from "mongoose";
import { Device } from "../models/Device";
import { startPlayback, togglePlayPause } from "../api/sonos";
import { IUser, IDevice } from "../models/models.interface";

const User = mongoose.model("User");

export const globalRFIDRegister = {};

export async function handleLoadPlaylist(deviceId: string, rfid: string, user: IUser) {

  console.log(
    `handleLoadPlaylist -> Got a request for device: ${deviceId} and rfid: ${rfid} and user: ${user.username}`
  );
  let chip = user.rfidChips.find((el) => el.id === rfid);
  let device = user.devices.find((el) => el.deviceId === deviceId);
  if (chip && device) {
    await startPlayback(device.sonosGroupId, chip.sonosPlaylistId, user);
  } else if (!chip) {
    console.log("no chip found with id : ", rfid);
  } else if (!device) {
    console.log("no device found with name: ", deviceId);
  }
}



export async function handlePlayback(deviceId, command, user: IUser) {
  console.log(
    `handlePlayback -> Got a request with device: ${deviceId} and command: ${command} and user: ${user.username}`
  );

  let device = user.devices.find((el) => el.deviceId === deviceId);
  if (device) {
    await togglePlayPause(device.sonosGroupId, command, user);
  } else if (!device) {
    console.log("no device found with id: ", deviceId);
  }
}

/* Every time the Nodemcu restarts, it triggers this function. First time we store device to db,  */

export async function handleSetDevice(userId: string, deviceId: string) {
  console.log("setting device...");

  User.findById(userId, (err, user: IUser) => {
    if (err) {
      console.log("error finding user with user secret: ", err);
    }
    if (!user) {
      console.log("couldn't find user with userId: ", userId);
      //TODO: Send mqtt response back to blink LEDS or something
    } else {
      console.log("setDevice -> found user: ", user._id);

      // save new device
      Device.findOne({ deviceId }, (err: Error, device: IDevice) => {
        if (err) {
          console.log("error finding device: ", err);
        } else {
          if (!device) {
            console.log("handleSetDevice -> Brand new device! saving it.");

            device = new Device({
              user: user._id,
              deviceId,
            });

            device.save((err) => {
              if (err) {
                console.log("couldn't save device", err);
              }
            });
          } else {
            console.log("handleSetDevice -> Not a new device.");
          }

          if (!user.devices.includes(device._id)) {
            user.devices.push(device._id);
            user.save(function(err) {
              if (err) {
                console.log("TCL: err", err);
              }
              console.log("saved user with new device");
            });
          }
        }
      });
    }
  });
}

export async function handleSaveDevicePong(userId: string, deviceId: string) {



  User.findOne({ userId }, (err, user: IUser) => {
    if (err) {
      console.log("error finding user with user secret: ", err);
    }
    if (!user) {
      console.log(`couldn't find user with userId: ${userId}`, );

    } else {
      console.log("handleDevicePong -> found user: ", user.username);

      // Update device lastPong
      Device.findOne({ deviceId, userId }, (err: Error, device: IDevice) => {
        if (err) {
          console.log("error finding device: ", err);
        } else {
          if (!device) {
            console.log("handleDevicePong -> Found no device with deviceId: ", deviceId);


          } else {
            console.log("handleDevicePong -> Setting device lastPong on device: ", deviceId);

            device.lastPong = new Date();

            device.save((err) => {
              if (err) {
                console.log("couldn't save device", err);
              } else {
                console.log("device lastPong updated");
              }
            });
          }
        }
      });
    }
  });
}
