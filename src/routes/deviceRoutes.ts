import express from "express";
import passport from "passport";
import { devicePing } from "../mqttHandler";
import { getToken } from "./api";
import { IDevice } from "../models/models.interface";
import { Device } from "../models/Device";
import { data, updateUuidList } from "../data/deviceUuids";

const router = express.Router();


/* GET Devices*/
router.get("/", passport.authenticate("jwt", { session: false }), function(req, res) {
  const token: string = getToken(req.headers);
  if (token) {
    Device.find({ user: req.user._id })
      .populate("user")
      .exec((err: Error, devices: IDevice[]) => {
        if (err) {

          console.log("error finding devices: ", err);
          res.status(404).send();
        } else {
          res.send(devices);
        }
      });
  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
});


/* GET single Device*/
router.get("/:deviceName", passport.authenticate("jwt", { session: false }), function(req, res) {
  const token: string = getToken(req.headers);
  if (token) {
    Device.findOne({ user: req.user._id, deviceName: req.params.deviceName })
      .exec((err: Error, device: IDevice) => {
        if (err) {
          console.log("error finding device: ", err);
          res.status(404).send(err);
        } else {
          res.json(device);
        }
      });

  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
});



/* Create new Device*/
router.post("/:id", passport.authenticate("jwt", { session: false }), function(req, res) {
  const token: string = getToken(req.headers);
  if (token) {
    Device.findOne({ user: req.user._id, deviceName: req.params.deviceName })
      .exec((err: Error, device: IDevice) => {
        if (err) {
          console.log("error finding device: ", err);
          res.status(404).send(err);
        } else {
          res.json(device);
        }
      });

    // Create new device
 /*   device = new Device({
      userSecret: uS,
      deviceName,
      user: user._id,
      sonosGroupId: ""
    });

    device.save((err) => {
      if (err) {
        console.log("couldn't save device", err);
      }
    });*/

  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
});



/* UPDATE Device*/
router.put("/:deviceName", passport.authenticate("jwt", { session: false }), function(req, res) {
  const token: string = getToken(req.headers);
  if (token) {

    const updatedDevice = req.body;
    console.log(typeof updatedDevice);


    Device.replaceOne({ user: req.user._id, deviceName: req.params.deviceName }, updatedDevice, (err) => {
      if (err) {
        console.log("error finding device: ", err);
        res.status(404).send(err);
      } else {
        res.json(updatedDevice);
      }
    });


  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
});

// Verify Device ID (check that it exists in uuid file
router.get("/:id/verify/", passport.authenticate("jwt", {session: false}), async function(req,res) {
  const token: string = getToken(req.headers);
  const {id} = req.params
  console.log("ID:  ", id);

  if (token) {
    let foundDeviceId = data.find(e => e.deviceId === id)
    console.log("found device!");
    if (foundDeviceId) {
      res.send()

    } else {
      return res.status(404).send()
    }

  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }

})

router.get("/:id/setuser/", passport.authenticate("jwt", {session: false}), async function(req,res) {
  const token: string = getToken(req.headers);
  const {id} = req.params
  if (token) {
    const uuidList = data;
    let foundDeviceId = uuidList.find(e => e.deviceId === id)
    console.log("data:", uuidList)

    if (foundDeviceId) {
      foundDeviceId.assignedUserId = req.user._id
      console.log("Updated list: ", uuidList);
      await updateUuidList(uuidList)

    } else {
      return res.status(404).send()
    }
    res.send()

  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }

})



/* Assign device with sonos group */
router.post(
  "/:id/assign",
  passport.authenticate("jwt", { session: false }),
  function(req, res) {
    const token: string = getToken(req.headers);

    console.log("correct route");

    if (token) {

      const {sonosGroupId, sonosHouseholdId}: {sonosGroupId: string, sonosHouseholdId: string} = req.body;

      Device.findById(req.params.id).exec(async (err: Error, device: IDevice) => {
        if (err) {
          console.log("error finding device: ", err);
          res.send(err);
        } else {
          device.sonosGroupId = sonosGroupId;
          device.sonosHouseholdId = sonosHouseholdId;
          await device.save(function(err: Error) {
            if (err) {
              console.log("TCL: err", err);
              res.status(500).send();
            }
            res.json(device);
          });
        }
      });
    } else {
      return res.status(403).send({ success: false, msg: "Unauthorized." });
    }
  }
);



/* PING device*/
router.get("/:deviceName/ping", passport.authenticate("jwt", { session: false }), function(req, res) {
  const token: string = getToken(req.headers);
  if (token) {
    devicePing(req.params.deviceName, req.user.userSecret);
    res.send();

  } else {
    return res.status(403).send({ success: false, msg: "Unauthorized." });
  }
});


module.exports = router;