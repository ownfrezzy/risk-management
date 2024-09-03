using {riskmanagement as rm} from '../db/schema';

@path: 'service/risk'
service RiskService {
    entity Risks       as projection on rm.Risks;
    annotate Risks with @odata.draft.enabled;

    entity Mitigations as projection on rm.Mitigations;
    annotate Mitigations with @odata.draft.enabled;

    entity Items as projection on rm.Items;

    function getItems(exactQuantity: Integer) returns Array of Items;
    action createItem(title: String, descr: String, quantity: Integer) returns Items;
}
