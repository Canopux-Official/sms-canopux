import { Response } from "express";
import { AuthRequest } from "../middlewares/verifyAuth";
import Stream from "../models/Stream";

export const getAllStreams = async (req: AuthRequest, res: Response) => {
    try {
        const streams = await Stream.find({ organizationId: req.user?.organizationId }).sort({ name: 1 });
        return res.status(200).json(streams);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching streams", error });
    }
};


export const addStream = async (req: AuthRequest, res: Response) => {
    try {
        const { name, isActive } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const newStream = await Stream.create({ name, isActive, organizationId: req.user?.organizationId });
        return res.status(201).json(newStream);
    } catch (error) {
        return res.status(500).json({ message: "Error adding stream", error });
    }
};

export const updateStream = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updatedStream = await Stream.findOneAndUpdate(
            { _id: id, organizationId: req.user?.organizationId },
            req.body,
            { new: true }
        );
        if (!updatedStream) return res.status(404).json({ message: "Stream not found" });
        return res.status(200).json(updatedStream);
    } catch (error) {
        return res.status(500).json({ message: "Error updating stream", error });
    }
};

export const deleteStream = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Stream.findOneAndDelete({ _id: id, organizationId: req.user?.organizationId });
        if (!deleted) return res.status(404).json({ message: "Stream not found" });
        return res.status(200).json({ message: "Stream deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting stream", error });
    }
};


export const getAllActiveStreams = async (req: AuthRequest, res: Response) => {
    try {
        const streams = await Stream.find({ isActive: true, organizationId: req.user?.organizationId }).sort({ name: 1 });
        return res.status(200).json(streams);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching streams", error });
    }
};


export const getStreamCount = async (organizationId: string) => {
    try {
        const count = await Stream.countDocuments({ organizationId });
        return count;
    } catch (error) {
        return { message: "Error fetching stream count", error };
    }
};
export const getActiveStreamCount = async (organizationId: string) => {
    try {
        const count = await Stream.countDocuments({ isActive: true, organizationId });
        return count;
    } catch (error) {
        return { message: "Error fetching active stream count", error };
    }
};
