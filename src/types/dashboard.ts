export type LoggedInUser = {
  um_id?: number;
  username?: string;
  um_fullname?: string;
  um_email?: string;
  um_mobile?: string;
  um_gender?: string;
  um_profile_image?: string;
  um_last_login?: string | null;
  userroles?: Array<{
    ur_id?: number;
    ur_role_id?: number;
    lk?: {
      lk_longname?: string;
      lk_setname?: string;
    };
  }>;
};

export type DashboardModel = {
  [key: `parameter${number}`]: string | undefined;
  [key: `flag${number}`]: number | undefined;
  [key: `value${number}`]: string | null | undefined;
  [key: `link${number}`]: string | undefined;
};

export type DashboardResponse = {
  response?: string;
  modelData?: DashboardModel;
};

export type DashboardCard = {
  index: number;
  title: string;
  value: string;
  link: string;
  icon: string;
};

export type CaseSummaryData = {
  PetAdvocateCaseCount?: string;
  ResAdvocateCaseCount?: string;
};

export type CauseListRow = {
  Case_Type_Name?: string;
  cause_reg_no?: string | number;
  case_no?: string | number;
  cause_reg_year?: string | number;
  court_no?: string | number;
  curSlno?: string | number;
  sr_no?: string | number;
  Bench_Name?: string;
  listing_date?: string;
  lastOrder?: string | number | null;
  [key: string]: unknown;
};
