
import { mockDocuments } from "../data/mockDocuments";
export const getDocuments = async () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockDocuments), 500);
    });
};
