import { Request, Response } from "express";
import Subject from "../models/Subject";

export const getAllSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await Subject.find({}).sort({ name: 1 });
        return res.status(200).json({ subjects });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addSubject = async (req: Request, res: Response) => {
    try {
        const { name, isActive } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const newSubject = await Subject.create({ name, isActive });
        return res.status(201).json(newSubject);
    } catch (error) {
        return res.status(500).json({ message: "Error adding subject", error });
    }
};

export const updateSubject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedSubject = await Subject.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedSubject) return res.status(404).json({ message: "Subject not found" });
        return res.status(200).json(updatedSubject);
    } catch (error) {
        return res.status(500).json({ message: "Error updating subject", error });
    }
};

export const deleteSubject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Subject.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Subject not found" });
        return res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting subject", error });
    }
};
export const getAllActiveSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await Subject.find({isActive: true}).sort({ name: 1 });
        return res.status(200).json({ subjects });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getSubjectCount = async ()=> {
    try {
        const count = await Subject.countDocuments({});
        return count;
    } catch (error) {
       return {
            message: "Error fetching subject count",
            error
        };
    }
};
export const getActiveSubjectCount = async () => {
    try {
        const count = await Subject.countDocuments({ isActive: true });
        return count;
    } catch (error) {
        return {
            message: "Error fetching active ssubject count",
            error
        };
    }
};