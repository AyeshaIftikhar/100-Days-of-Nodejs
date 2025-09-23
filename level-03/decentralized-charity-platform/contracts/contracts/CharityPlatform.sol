// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CharityPlatform
 * @dev A decentralized charity platform that enables transparent donations
 */
contract CharityPlatform is ReentrancyGuard, Ownable {
    uint256 private _charityIdCounter = 0;
    uint256 private _donationIdCounter = 0;
    
    struct Charity {
        uint256 id;
        address payable wallet;
        string name;
        string description;
        string category;
        string imageUrl;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 withdrawnAmount;
        bool isActive;
        bool isVerified;
        uint256 createdAt;
        string[] documents; // IPFS hashes of verification documents
    }
    
    struct Donation {
        uint256 id;
        uint256 charityId;
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message;
        bool isAnonymous;
    }
    
    mapping(uint256 => Charity) public charities;
    mapping(uint256 => Donation) public donations;
    mapping(address => uint256[]) public charityOwnerToIds;
    mapping(address => uint256[]) public donorToDonationIds;
    mapping(uint256 => uint256[]) public charityToDonationIds;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFee = 250;
    address payable public feeRecipient;
    
    event CharityCreated(
        uint256 indexed charityId,
        address indexed owner,
        string name,
        uint256 targetAmount
    );
    
    event CharityVerified(uint256 indexed charityId, bool verified);
    
    event DonationMade(
        uint256 indexed donationId,
        uint256 indexed charityId,
        address indexed donor,
        uint256 amount,
        bool isAnonymous
    );
    
    event FundsWithdrawn(
        uint256 indexed charityId,
        address indexed charity,
        uint256 amount
    );
    
    event CharityUpdated(uint256 indexed charityId);
    
    modifier onlyCharityOwner(uint256 _charityId) {
        require(charities[_charityId].wallet == msg.sender, "Not charity owner");
        _;
    }
    
    modifier charityExists(uint256 _charityId) {
        require(_charityId > 0 && _charityId <= _charityIdCounter, "Charity does not exist");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        feeRecipient = payable(msg.sender);
    }
    
    /**
     * @dev Create a new charity
     */
    function createCharity(
        string memory _name,
        string memory _description,
        string memory _category,
        string memory _imageUrl,
        uint256 _targetAmount,
        string[] memory _documents
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_targetAmount > 0, "Target amount must be greater than 0");
        
        _charityIdCounter++;
        uint256 charityId = _charityIdCounter;
        
        charities[charityId] = Charity({
            id: charityId,
            wallet: payable(msg.sender),
            name: _name,
            description: _description,
            category: _category,
            imageUrl: _imageUrl,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            withdrawnAmount: 0,
            isActive: true,
            isVerified: false,
            createdAt: block.timestamp,
            documents: _documents
        });
        
        charityOwnerToIds[msg.sender].push(charityId);
        
        emit CharityCreated(charityId, msg.sender, _name, _targetAmount);
        
        return charityId;
    }
    
    /**
     * @dev Donate to a charity
     */
    function donate(
        uint256 _charityId,
        string memory _message,
        bool _isAnonymous
    ) external payable charityExists(_charityId) nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(charities[_charityId].isActive, "Charity is not active");
        
        _donationIdCounter++;
        uint256 donationId = _donationIdCounter;
        
        donations[donationId] = Donation({
            id: donationId,
            charityId: _charityId,
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: _message,
            isAnonymous: _isAnonymous
        });
        
        charities[_charityId].raisedAmount += msg.value;
        donorToDonationIds[msg.sender].push(donationId);
        charityToDonationIds[_charityId].push(donationId);
        
        emit DonationMade(donationId, _charityId, msg.sender, msg.value, _isAnonymous);
    }
    
    /**
     * @dev Withdraw funds from charity
     */
    function withdrawFunds(uint256 _charityId, uint256 _amount) 
        external 
        charityExists(_charityId)
        onlyCharityOwner(_charityId)
        nonReentrant 
    {
        Charity storage charity = charities[_charityId];
        uint256 availableAmount = charity.raisedAmount - charity.withdrawnAmount;
        
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= availableAmount, "Insufficient funds");
        require(charity.isVerified, "Charity must be verified");
        
        charity.withdrawnAmount += _amount;
        
        // Calculate platform fee
        uint256 fee = (_amount * platformFee) / 10000;
        uint256 charityAmount = _amount - fee;
        
        // Transfer funds
        if (fee > 0) {
            feeRecipient.transfer(fee);
        }
        charity.wallet.transfer(charityAmount);
        
        emit FundsWithdrawn(_charityId, charity.wallet, charityAmount);
    }
    
    /**
     * @dev Verify a charity (only owner)
     */
    function verifyCharity(uint256 _charityId, bool _verified) 
        external 
        onlyOwner 
        charityExists(_charityId) 
    {
        charities[_charityId].isVerified = _verified;
        emit CharityVerified(_charityId, _verified);
    }
    
    /**
     * @dev Update charity status
     */
    function updateCharityStatus(uint256 _charityId, bool _isActive) 
        external 
        charityExists(_charityId)
        onlyCharityOwner(_charityId)
    {
        charities[_charityId].isActive = _isActive;
        emit CharityUpdated(_charityId);
    }
    
    /**
     * @dev Update charity information
     */
    function updateCharity(
        uint256 _charityId,
        string memory _name,
        string memory _description,
        string memory _imageUrl,
        uint256 _targetAmount
    ) external charityExists(_charityId) onlyCharityOwner(_charityId) {
        Charity storage charity = charities[_charityId];
        
        if (bytes(_name).length > 0) {
            charity.name = _name;
        }
        if (bytes(_description).length > 0) {
            charity.description = _description;
        }
        if (bytes(_imageUrl).length > 0) {
            charity.imageUrl = _imageUrl;
        }
        if (_targetAmount > 0) {
            charity.targetAmount = _targetAmount;
        }
        
        emit CharityUpdated(_charityId);
    }
    
    /**
     * @dev Set platform fee (only owner)
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%"); // Maximum 10%
        platformFee = _fee;
    }
    
    /**
     * @dev Set fee recipient (only owner)
     */
    function setFeeRecipient(address payable _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
    
    // View functions
    
    function getAllCharities() external view returns (Charity[] memory) {
        uint256 totalCharities = _charityIdCounter;
        Charity[] memory allCharities = new Charity[](totalCharities);
        
        for (uint256 i = 1; i <= totalCharities; i++) {
            allCharities[i - 1] = charities[i];
        }
        
        return allCharities;
    }
    
    function getActiveCharities() external view returns (Charity[] memory) {
        uint256 totalCharities = _charityIdCounter;
        uint256 activeCount = 0;
        
        // Count active charities
        for (uint256 i = 1; i <= totalCharities; i++) {
            if (charities[i].isActive) {
                activeCount++;
            }
        }
        
        Charity[] memory activeCharities = new Charity[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= totalCharities; i++) {
            if (charities[i].isActive) {
                activeCharities[currentIndex] = charities[i];
                currentIndex++;
            }
        }
        
        return activeCharities;
    }
    
    function getCharityDonations(uint256 _charityId) 
        external 
        view 
        charityExists(_charityId)
        returns (Donation[] memory) 
    {
        uint256[] memory donationIds = charityToDonationIds[_charityId];
        Donation[] memory charityDonations = new Donation[](donationIds.length);
        
        for (uint256 i = 0; i < donationIds.length; i++) {
            charityDonations[i] = donations[donationIds[i]];
        }
        
        return charityDonations;
    }
    
    function getDonorDonations(address _donor) external view returns (Donation[] memory) {
        uint256[] memory donationIds = donorToDonationIds[_donor];
        Donation[] memory donorDonations = new Donation[](donationIds.length);
        
        for (uint256 i = 0; i < donationIds.length; i++) {
            donorDonations[i] = donations[donationIds[i]];
        }
        
        return donorDonations;
    }
    
    function getCharityOwnerCharities(address _owner) external view returns (Charity[] memory) {
        uint256[] memory charityIds = charityOwnerToIds[_owner];
        Charity[] memory ownerCharities = new Charity[](charityIds.length);
        
        for (uint256 i = 0; i < charityIds.length; i++) {
            ownerCharities[i] = charities[charityIds[i]];
        }
        
        return ownerCharities;
    }
    
    function getTotalCharities() external view returns (uint256) {
        return _charityIdCounter;
    }
    
    function getTotalDonations() external view returns (uint256) {
        return _donationIdCounter;
    }
    
    function getCharityBalance(uint256 _charityId) 
        external 
        view 
        charityExists(_charityId)
        returns (uint256) 
    {
        return charities[_charityId].raisedAmount - charities[_charityId].withdrawnAmount;
    }
}
