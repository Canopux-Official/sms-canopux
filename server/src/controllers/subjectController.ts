import { Response } from "express";
import { AuthRequest } from "../middlewares/verifyAuth";
import Subject from "../models/Subject";

export const getAllSubjects = async (req: AuthRequest, res: Response) => {
    try {
        // const subjects = await Subject.find({}).sort({ name: 1 });
        const subjects = await Subject.find({ organizationId: req.user?.organizationId }).sort({ name: 1 });
        return res.status(200).json({ subjects });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { name, isActive } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });

        const trimmedName = name.trim();

        const existingSubject = await Subject.findOne({
            organizationId: req.user?.organizationId,
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
        });

        if (existingSubject) {
            return res.status(409).json({ message: `Subject "${existingSubject.name}" already exists` });
        }

        const newSubject = await Subject.create({ name: trimmedName, isActive, organizationId: req.user?.organizationId });
        return res.status(201).json(newSubject);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Subject with this name already exists" });
        }
        return res.status(500).json({ message: "Error adding subject", error });
    }
};

export const updateSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (updateData.name) {
            updateData.name = updateData.name.trim();
            if (!updateData.name) return res.status(400).json({ message: "Name cannot be empty" });

            const existingSubject = await Subject.findOne({
                organizationId: req.user?.organizationId,
                name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
                _id: { $ne: id }
            });

            if (existingSubject) {
                return res.status(409).json({ message: `Subject "${existingSubject.name}" already exists` });
            }
        }

        const updatedSubject = await Subject.findOneAndUpdate(
            { _id: id, organizationId: req.user?.organizationId },
            updateData,
            { new: true }
        );
        if (!updatedSubject) return res.status(404).json({ message: "Subject not found" });
        return res.status(200).json(updatedSubject);
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Subject with this name already exists" });
        }
        return res.status(500).json({ message: "Error updating subject", error });
    }
};

export const deleteSubject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        // const deleted = await Subject.findByIdAndDelete(id);
        const deleted = await Subject.findOneAndDelete({ _id: id, organizationId: req.user?.organizationId });
        if (!deleted) return res.status(404).json({ message: "Subject not found" });
        return res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting subject", error });
    }
};
export const getAllActiveSubjects = async (req: AuthRequest, res: Response) => {
    try {
        // const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
        const subjects = await Subject.find({ isActive: true, organizationId: req.user?.organizationId }).sort({ name: 1 });
        return res.status(200).json({ subjects });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getSubjectCount = async (organizationId: string) => {
    try {
        const count = await Subject.countDocuments({ organizationId });
        return count;
    } catch (error) {
        return {
            message: "Error fetching subject count",
            error
        };
    }
};
export const getActiveSubjectCount = async (organizationId: string) => {
    try {
        const count = await Subject.countDocuments({ isActive: true, organizationId });
        return count;
    } catch (error) {
        return {
            message: "Error fetching active ssubject count",
            error
        };
    }
};