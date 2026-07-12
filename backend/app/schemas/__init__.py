from backend.app.schemas.user import RoleBase, RoleOut, UserBase, UserCreate, UserUpdate, UserOut
from backend.app.schemas.auth import Token, TokenPayload, LoginRequest, RefreshTokenRequest, ChangePasswordRequest
from backend.app.schemas.department import DepartmentBase, DepartmentCreate, DepartmentUpdate, DepartmentOut
from backend.app.schemas.category import CategoryBase, CategoryCreate, CategoryUpdate, CategoryOut
from backend.app.schemas.emission_factor import EmissionFactorBase, EmissionFactorCreate, EmissionFactorUpdate, EmissionFactorOut
from backend.app.schemas.product_esg_profile import ProductESGProfileBase, ProductESGProfileCreate, ProductESGProfileUpdate, ProductESGProfileOut
from backend.app.schemas.environmental_goal import EnvironmentalGoalBase, EnvironmentalGoalCreate, EnvironmentalGoalUpdate, EnvironmentalGoalOut
from backend.app.schemas.policy import PolicyBase, PolicyCreate, PolicyUpdate, PolicyOut
from backend.app.schemas.badge import BadgeBase, BadgeCreate, BadgeUpdate, BadgeOut
from backend.app.schemas.reward import RewardBase, RewardCreate, RewardUpdate, RewardOut
from backend.app.schemas.carbon_transaction import CarbonTransactionBase, CarbonTransactionCreate, CarbonTransactionUpdate, CarbonTransactionOut
from backend.app.schemas.social import (
    CSRActivityBase, CSRActivityCreate, CSRActivityUpdate, CSRActivityOut,
    CSRParticipationBase, CSRParticipationCreate, CSRParticipationUpdate, CSRParticipationOut,
    TrainingBase, TrainingCreate, TrainingUpdate, TrainingOut,
    TrainingCompletionBase, TrainingCompletionCreate, TrainingCompletionOut,
    DiversityMetricBase, DiversityMetricCreate, DiversityMetricOut
)
from backend.app.schemas.governance import (
    PolicyAcknowledgementBase, PolicyAcknowledgementCreate, PolicyAcknowledgementOut,
    AuditBase, AuditCreate, AuditUpdate, AuditOut,
    ComplianceIssueBase, ComplianceIssueCreate, ComplianceIssueUpdate, ComplianceIssueOut
)
from backend.app.schemas.gamification import (
    ChallengeBase, ChallengeCreate, ChallengeUpdate, ChallengeOut,
    ChallengeParticipationBase, ChallengeParticipationCreate, ChallengeParticipationUpdate, ChallengeParticipationOut,
    RewardRedemptionBase, RewardRedemptionCreate, RewardRedemptionUpdate, RewardRedemptionOut,
    UserBadgeBase, UserBadgeCreate, UserBadgeOut
)
from backend.app.schemas.settings_notifications import (
    SettingBase, SettingCreate, SettingUpdate, SettingOut,
    NotificationBase, NotificationCreate, NotificationUpdate, NotificationOut
)
