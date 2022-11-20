export type ModeItem = {
  key: string;
  title: string;
  desc?: string;
  recommended?: boolean;
};

export type StepBtnItem = {
  text?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export type StepBtnProps = {
  prevBtn?: StepBtnItem;
  nextBtn?: StepBtnItem;
};
