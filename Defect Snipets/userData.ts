import { IAppLink } from './appLink';
import { TLocalTapListRequest } from './localTapList';
import { AccountType, TGiftCardWallet, TPaymentCard } from './payment';
import { ResponseError } from './responseError';
import { RewardStatus } from './rewards';
import { IPostReceiptClaimNumberResponse } from './rewardsScanReceipt';
import { ILocalTapList, TFeatures, TStore, TStoreAdditionalFeatures } from './storeList';

export type TUserDetailsPhone = {
  number: string;
  isPreferred: boolean;
  isValid?: boolean;
};

export type TUserDetailsMarketing = {
  type: string;
};

export type TUserDetailsLocations = {
  id: string;
  isPreferred: boolean;
};

export enum EPromotionsOptions {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum ERewardsActivityType {
  ADJUSTMENT = 'ADJUSTMENT',
  BASE_EARN = 'BASE_EARN',
  CERTIFICATE_REDEMPTION = 'CERTIFICATE_REDEMPTION',
  CANCELLED_CERTIFICATE = 'CANCELLED_CERTIFICATE',
  BONUS = 'BONUS',
  EXPIRED = 'EXPIRED',
}

export type TUserDetailsPreferences = {
  postalCode?: string;
  marketing?: TUserDetailsMarketing[];
  locations?: TUserDetailsLocations[];
};

export type TUserDetailsReferences = {
  type: string;
  id: string;
};

export type TCustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string; //2000-12-31
  phones?: TUserDetailsPhone[];
  preferences?: TUserDetailsPreferences;
  references?: TUserDetailsReferences[];
  profileAvatarUrl: string;
  defaultProfileAvatarUrl?: string;
  // isDefaultTandCAccepted
  // termsAndConditions
  // createdDate
};

export type TPutCustomerInfoRequest = {
  body: TCustomerInfo;
};

export type TGetCustomerInfoRequest = {
  isIncludeTandC?: boolean;
};

export type TCarouselCardButtonNavigationLink = {
  routeName?: string;
  screenName: string;
};

export enum EEarnPointsInfoButtonLinkType {
  NAVIGATION_LINK = 'NAVIGATION_LINK',
}

export type EarnPointsInfoCard = {
  backgroundImage: string;
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  primaryCTAAction: IAppLink;
  buttonLinkType: EEarnPointsInfoButtonLinkType;
};

export type TEarnPointsInfoResponse = {
  earnPointsInfo?: EarnPointsInfoCard[];
};

export type TMyTeamsInfo = {
  questionId: string;
  answerId: string;
};

export type TPutTeamsRequest = {
  surveyId: string;
  replies: TMyTeamsInfo[];
};

export interface IMyTeamsReply extends IMyTeamsCategory {
  questionId: string;
  questionText?: string;
}

export interface IMyTeamsCategory {
  id: string;
  text: string;
  isDefault?: boolean;
}

export interface IMyTeamQuestion {
  id: string;
  text: string;
  answers: IMyTeamsCategory[];
}

export interface IMyTeams {
  id: string;
  description: string;
  questions: IMyTeamQuestion[];
  replies: IMyTeamsReply[];
}

export type TUploadedProfileAvatar = {
  profileAvatarUrl: string;
};

export type TUploadProfileAvatarRequest = {
  uri: string;
};
export type TOfferEligibleItem = {
  menuId: string;
  quantity: number;
};

export enum TOfferBuyGetItemRule {
  'ONE_OF' = 'ONE_OF',
  'ALL_OF' = 'ALL_OF',
}

export type TOffferBuyAndGetItem = {
  rule: TOfferBuyGetItemRule;
  menuIds: TOfferEligibleItem[];
};

export type TOfferApplicabilityItem = {
  buyCount?: number;
  getCount?: number;
  eligibleIds?: TOfferEligibleItem[];
  buyIds?: TOffferBuyAndGetItem[];
  getIds?: TOffferBuyAndGetItem[];
  isIncludesAll: boolean;
  maxRecurrence: number;
  price?: string;
  percent?: string;
  storeIds?: string[];
};
export enum EOfferStatuses {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EOfferType {
  SET_PRICE = 'SET_PRICE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PERCENT = 'PERCENT',
  BUY_X_GET_Y_SET_PRICE = 'BUY_X_GET_Y_SET_PRICE',
  BUY_X_GET_Y_PERCENT = 'BUY_X_GET_Y_PERCENT',
  BUY_X_GET_Y_FIXED = 'BUY_X_GET_Y_FIXED',
  OFFER_CODE = 'OFFER_CODE',
}

export interface ILocationRestrictions {
  isAllLocations: boolean;
  exclusion?: boolean;
  locations?: Array<{
    id: string;
  }>;
}

export interface ICheckAmount {
  amount: string;
  currencyCode: string;
}

export interface ICheckRestrictions {
  minimumCheckAmount: ICheckAmount;
  maximumCheckAmount: ICheckAmount;
}

export enum RedemptionType {
  IN_APP_ONLY = 'IN_APP_ONLY',
  NOT_REQUIRED = 'NOT_REQUIRED',
}

export interface IRedemptionTimeRange {
  duration: string;
  endTime: string;
  startTime: string;
  weekday: string;
}

export type TOffer = {
  id: string;
  userOfferId: string;
  name: string;
  imageUrl: string;
  homeBannerImageUrl?: string;
  code: string;
  startDateTime: string;
  endDateTime: string;
  displayExpirationDate: string;
  terms: string;
  isRedeemableInStoreOnly: boolean;
  isRedeemableOnlineOnly: boolean;
  isRedeemableInStore: boolean;
  isRedeemableOnline: boolean;
  status: EOfferStatuses;
  description: string;
  applicability: TOfferApplicabilityItem;
  type: EOfferType;
  qrCode?: string;
  locationRestrictions: ILocationRestrictions;
  checkRestrictions?: ICheckRestrictions;
  isExpired?: boolean;
  redemptionDate?: string;
  redemptionType?: RedemptionType; // Sonic
  redemptionTimeRanges?: IRedemptionTimeRange[];
  posDiscountId?: string;
  points?: number;
};

export type TCertificate = {
  number: string;
  priceInPoints: number;
  expirationDateTime: string;
  type: string;
  title: string;
  code: string;
  status: string;
  category: string;
  imageUrl: string;
};

export type TUserRewardsParams = {
  status?: RewardStatus;
  location?: string;
};

export type TUserRewardsResponse = {
  totalCount: number;
  offers: TOffer[];
  certificates: TCertificate[];
};

export type TActivateOfferRequest = {
  code: string;
  offerId: string;
};

export type TUserRewardsPointsData = {
  pointsBalance?: number;
  pointsExpiring?: number;
  pointsExpiringDate?: string;
  lastActivityDate?: string;
  pointsLimitToRewards?: number;
  tierInformation?: TCustomerAccountLoyaltyTierInformation;
  tierConfiguration?: {
    tiers: ICustomerLoyaltyTierDetails[];
  };
};

export enum ETierRequirement {
  ELIGIBLE_YTD_SPEND = 'ELIGIBLE_YTD_SPEND',
  QUALIFIED_VISITS = 'QUALIFIED_VISITS',
}

export interface ICustomerLoyaltyTierDetails {
  // example: TRTEST
  // Tier code
  code: ETierCodes;

  // example: ELITE
  // Tier name
  name: string;

  // Tier requirements/conditions
  requirements: ICustomerLoyaltyTierRequirement[];

  // example: 0
  // Tier rank
  rank: number;
}

export interface ICustomerLoyaltyTierRequirement {
  type: ETierRequirement;

  // example: 250.00
  // Threshold value (i.e. year-to-date eligible spend) for advancing to the next tier
  threshold: string;
}

export enum ETierCodes {
  LEGACY = '0',
  BASE = 'BASE',
  ELITE = 'ELITE',
}

export type TLoyaltyProfileTierStatus = {
  code: ETierCodes;
  name: string;
  expirationDate: string;
  progressSpend: number;
};

export type TLoyaltyConfigurationNextTier = {
  code: ETierCodes;
  name: string;
  thresholdSpend: number;
};

export type TCustomerAccountLoyaltyTierInformation = {
  tierStatus: TLoyaltyProfileTierStatus;
  nextTier?: TLoyaltyConfigurationNextTier;
};

export type TUserRewardsLoyaltyProfileData = {
  pointsBalance?: number;
  pointsExpiring?: number;
  pointsExpiringDate?: string;
  tierInformation?: TCustomerAccountLoyaltyTierInformation;
};

export type TUserRewardsPointsDataResponse = TUserRewardsPointsData;

interface IActivityPointsTransactionDetail {
  lineId: number;
  description: string;
  value: number;
  quantity: number;
  childItems: IActivityPointsTransactionDetail[];
}

interface IActivityPointsTransaction {
  number: string;
  total: number;
  pointsEligibleTotal: number;
  tax: number;
  details: IActivityPointsTransactionDetail[];
}

interface IActivityPointsOffer {
  code: string;
  title: string;
}

interface IActivityPointsCertificate {
  certificateNumber: string;
  title: string;
}

export interface IPointsDetails {
  type: 'BASE' | 'BONUS' | 'TIER_BONUS';
  amount: number;
}

export type TUserRewardsPointsActivityObj = {
  points: number;
  description: string;
  type: ERewardsActivityType;
  balancePoints: number;
  createdDate: string;
  storeId: string | null;
  storeLocation: string | null;
  tierCode?: ETierCodes;
  pointsDetails?: IPointsDetails[];
  transaction?: IActivityPointsTransaction;
  offers?: IActivityPointsOffer[];
  certificates?: IActivityPointsCertificate[];
};

export type TUserRewardsPointsActivityList = TUserRewardsPointsActivityObj[];

export type TGetUserRewardsPointsActivityResponse = TUserRewardsPointsActivityList;

export type TOfferQrCodeRequest = {
  offerId: string;
};

export type TOfferQrCodeResponse = string;

type ISODateString = string;

export type TPostUserCheckInRequest = {
  checkInDate: ISODateString;
  showGlobalToast?: true;
};

export type TPostUserCheckInResponse = {
  customerId: string;
  store: {
    storeId: string;
    checkin: {
      message: string;
    };
    storeInfo: unknown;
  };
};

export type TUserDetails = {
  customerId?: string;
  firstName?: string;
  createdDate?: string;
  lastName?: string;
  email?: string;
  birthDate?: string;
  phones?: TUserDetailsPhone[];
  preferences?: TUserDetailsPreferences;
  references?: TUserDetailsReferences[];
  segments?: TUserDetailsSegments[];
  creditCards?: TPaymentCard[];
  giftCards?: TGiftCardWallet[];
  profileAvatarUrl?: string;
  defaultProfileAvatarUrl?: string;
};

export enum ECheckInReqStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type TUserCheckInData = {
  lastCheckInDate?: ISODateString;
  showGlobalCheckInToast?: boolean;
  checkInStatus?: ECheckInReqStatus;
  storeId?: string;
  pointsEarned?: number;
  checkInMessage?: string;
  storeState?: string;
  storeZip?: number;
};

export type TEarnPointsInfo = EarnPointsInfoCard[];

export type TUserRewardsState = Partial<TUserRewardsResponse>;

export enum EReceiptClaimNumberRequestType {
  CLAIM_NUMBER = 'CLAIM_NUMBER',
  RECEIPT_DETAILS = 'RECEIPT_DETAILS',
  SCAN_QR_CODE = 'SCAN_QR_CODE',
}

export type TUserRewardsReceiptClaimNumberData = {
  requestType?: EReceiptClaimNumberRequestType;
  earnedPointsAmount?: string;
};

export type TUserRewards = {
  rewardsPoints?: TUserRewardsPointsData;
  earnPointsInfo?: TEarnPointsInfo;
  pointsActivity?: TUserRewardsPointsActivityList;
  checkInData?: TUserCheckInData;
  yourRewards?: TUserRewardsState;
  receiptClaimNumberData?: TUserRewardsReceiptClaimNumberData;
  userTierStatuses?: TUserLoyaltyStatus;
};

export type TDeliveryAddress = {
  addressLine1: string;
  addressLine2?: string;
  businessName?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  stateCode?: string;
  lat: number;
  lng: number;
  placeId: string;
};

export enum EPushState {
  // SELECTED state means that a user selected an option on rewards push modal (clicked on either button on rewards push modal)
  SELECTED,
  ENABLED,
  DISABLED,
}

export type TUserData = {
  store?: TStore;
  isLoggedIn: boolean;
  optPayInStore: boolean;
  userDetails: TUserDetails;
  userRewards: TUserRewards;
  deliveryAddress: TDeliveryAddress | Record<string, never>;
  myTeams: IMyTeams;
  contactDetails?: any;
  orderAheadAvailable?: any;
  storeId?: string;
  features?: TFeatures;
  additionalFeatures?: TStoreAdditionalFeatures;
  isOrderingUnavailableDueStoreWorkingHours: boolean;
  pushState?: EPushState;
  isEmailSubscribed?: boolean;
  authorizedUsers?: string[];
  pushPermissionStatus?: EPushState;
};

export type TUserDataState = TUserData;

export type TUserDetailsSuccessAction = TUserDetails;

export type TUserDetailsRequestAction = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferences?: TUserDetailsPreferences;
  profileAvatarUrl?: string;
  defaultProfileAvatarUrl?: string;
};

export type TToastMessageOptions = {
  key: string;
  options?: Record<string, unknown>;
};

export type TUserDetailsRequestMeta = {
  toastMessage: TToastMessageOptions;
};

export type TUpdateUserInfoQueryArgs = {
  payload: TUserDetailsRequestAction;
  meta: TUserDetailsRequestMeta;
};

export type TRemovePaymentCardQueryArgs = { cardToken: string; accountType?: AccountType; nextCard?: TPaymentCard };

export type TUserRewardsPointsDataSuccessAction = TUserRewardsPointsData;

export type TGetEarnPointsInfoSuccessAction = TEarnPointsInfoResponse;

export type TGetUserRewardsPointsActivitySuccessAction = TUserRewardsPointsActivityList;
export type TGetUserRewardsPointsActivityRequest = {
  fromDate: string;
};

export type TPostUserCheckInSuccessAction = TPostUserCheckInResponse & {
  checkInDate: ISODateString;
  showGlobalToast?: true;
};

export type TGetUserStoreTapListRequestAction = TLocalTapListRequest;

export type TGetUserStoreTapListSuccessAction = {
  localTapList: ILocalTapList;
};

export type TOfferQrCodeSuccessAction = {
  offerId: string;
  qrCode: string;
};

export enum ESource_Type {
  CAMERA = 'CAMERA',
  GALLERY = 'GALLERY',
}

export type TPostReceiptClaimNumberRequestAction = {
  claimNumber: string;
  requestType: EReceiptClaimNumberRequestType;
};

export type TPostReceiptClaimNumberSuccessAction = IPostReceiptClaimNumberResponse;

export type TPostUserCheckInFailureAction = ResponseError<{
  code: string;
  message: string;
}>;

export enum EYourRewardsTypes {
  OFFER = 'OFFER',
  CERTIFICATE = 'CERTIFICATE',
}
export enum ECertificateStatuses {
  ACTIVE = 'CERT_ACTIVE', // Redeemed certificate
  INACTIVE = 'CERT_INACTIVE', // Unredeemed certificate
  PENDING_CANCELLATION = 'PENDING_CANCELLATION', // Refund certificate pending
}

export type TYourRewardsType = {
  rewardType: EYourRewardsTypes;
};

export type TOfferExtended = TOffer & TYourRewardsType;

export type TCertificateExtended = TCertificate & TYourRewardsType;

export type TYourRewardsList = Array<TOfferExtended & TCertificateExtended>;

export type TUserDetailsSegments = {
  name: string;
};

export type TUserLoyaltyStatus = { [key: string]: UserLoyaltyStatus };

export type TPhoto = {
  uri: string;
  fileSize: number | null;
  source: ESource_Type;
};

export type TCheckboxState = {
  preferences: TUserDetailsPreferences;
};

export type UserLoyaltyStatus = {
  previousStatus: ETierCodes | undefined;
  currentStatus: ETierCodes | undefined;
};
