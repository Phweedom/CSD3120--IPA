# CSD3120--IPA

# Individual Progamming Assignment (IPA)

This project is for the assignment in the CSD3120 course by Zhuo Yijian (Student ID: 2001237). 
It involves setting up a Linux environment with WSL and installing npm and Node.js. 
The project also includes creating a web app using modified code and testing it.

## Requirements

- WSL
- Linux environment (Ubuntu)
- npm
- Node.js

Ensure that all of these dependencies are updated to the latest version by running the following commands:

- sudo apt-get update
- sudo apt-get upgrade


Install the project dependencies using the following command:

- npm install


## Usage

To build the project, run the following command:

- npm run build

To build the project extension for XRAuthor, run the following command:

- npm run build-ext

To run the web app, use the following command:

- npm run serve

## Changes Made

The `createScene` function has been renamed to `createXRScene` to match the project requirements.

## Documentation

Documentation for the `createXRScene` function is available.

## Testing

The web app has been tested and can be created using the modified code.

## Video

A video of the project can be found in the `assets/assets/2001237_ZhuoYijian/videos/0.webm` directory.

## B1 

See a virtual table with dynamically generated 3D atoms 

A 3D virtual classroom environment (VE) suitable for VR Classroom

A live video from XRAuthor suitable for an AR experience

## B2

Use a grab interaction to pick up atom and molecule objects to translate them in the environment by using Mouse. 
**Code the controller select, but can't seems to make it work**

## B3 

The Atoms not able to interact with each other. But the Sphere On the right is able to interact with each other.
**Interact Using Mouse Only**

## B4 

Wrote the code, but having issue with the controller selecting the Mesh so unable to rotate.
**Due to controller not able to select**

## B5

Wrote the code, but having issue with the controller selecting the Mesh so unable to Pinch.
**Due to controller not able to select**

## B6

Able to virtually navigate the virtual environment with a locomotion teleport method using controller's "Squeeze Button".

## Integrated XRAuthor

run - > npm run build-ext
put the files in "dist/ext" upload onto XRAuthor.

## Conclusion

This README provides an overview of the project and its requirements. It also includes information about changes made, documentation, and testing. The video directory is also listed for reference.

## Reference
