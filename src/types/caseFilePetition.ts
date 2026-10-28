export interface CaseFilePetition {
  CaseId: string;
  CINO: string;
  DisplayCaseno: string;
  PetitionerName: string;
  RespondentName: string;
  CaseStatus: string;
  judgmentID?: string | number;
  judgmentType?: string;
}