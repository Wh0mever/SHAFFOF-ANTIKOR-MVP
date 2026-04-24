export type UzexTender = {
  id: number;
  display_no: string;
  name: string;
  start_date: string;
  end_date: string;
  cost: number;
  seller_name: string | null;
  seller_tin: string | null;
  region_name: string;
  district_name: string;
  category_name: string | null;
  currency_codeabc: string;
};

export type RuleResult = {
  ruleCode: "SOLO" | "PRICE_SPIKE" | "SERIAL" | "RUSHED" | "ROUND" | "REGION";
  severity: number;
  message: string;
};
