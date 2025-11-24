import "../../styles/contractFilterHeader.css";
const ContractFilterHeader = ({ scope, setScope }) => {
    return (
        <div className="header-filter">


            <div className="filter-scope">
                <button
                    className={scope === "my" ? "active" : ""}
                    onClick={() => setScope("my")}
                >
                    Tài liệu của tôi
                </button>

                <button
                    className={scope === "org" ? "active" : ""}
                    onClick={() => setScope("org")}
                >
                    Tài liệu của tổ chức
                </button>
            </div>
        </div>
    );
};

export default ContractFilterHeader;
