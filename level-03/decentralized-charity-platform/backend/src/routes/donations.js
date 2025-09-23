const express = require('express');
const router = express.Router();

// Mock donations data
let donations = [
  {
    id: '1',
    charityId: '1',
    donor: '0x1234567890123456789012345678901234567890',
    amount: '2.5',
    timestamp: new Date('2024-01-15'),
    message: 'Keep up the great work!',
    isAnonymous: false,
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  },
  {
    id: '2',
    charityId: '1',
    donor: '0x2345678901234567890123456789012345678901',
    amount: '1.0',
    timestamp: new Date('2024-01-16'),
    message: 'Happy to help!',
    isAnonymous: true,
    txHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
  },
  {
    id: '3',
    charityId: '2',
    donor: '0x3456789012345678901234567890123456789012',
    amount: '5.0',
    timestamp: new Date('2024-01-17'),
    message: 'Education is the key to future',
    isAnonymous: false,
    txHash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff'
  }
];

// GET /api/donations - Get all donations with optional filters
router.get('/', (req, res) => {
  try {
    const { charityId, donor, limit = 50, offset = 0 } = req.query;
    let filteredDonations = [...donations];

    // Filter by charity ID
    if (charityId) {
      filteredDonations = filteredDonations.filter(
        donation => donation.charityId === charityId
      );
    }

    // Filter by donor address
    if (donor) {
      filteredDonations = filteredDonations.filter(
        donation => donation.donor.toLowerCase() === donor.toLowerCase()
      );
    }

    // Sort by timestamp (newest first)
    filteredDonations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedDonations = filteredDonations.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedDonations,
      pagination: {
        total: filteredDonations.length,
        offset: startIndex,
        limit: parseInt(limit),
        hasMore: endIndex < filteredDonations.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message
    });
  }
});

// GET /api/donations/:id - Get specific donation
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const donation = donations.find(d => d.id === id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message
    });
  }
});

// POST /api/donations - Record new donation (called after blockchain transaction)
router.post('/', (req, res) => {
  try {
    const {
      charityId,
      donor,
      amount,
      message,
      isAnonymous,
      txHash,
      blockNumber,
      gasUsed
    } = req.body;

    // Basic validation
    if (!charityId || !donor || !amount || !txHash) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: charityId, donor, amount, txHash'
      });
    }

    // Check if donation already recorded
    const existingDonation = donations.find(d => d.txHash === txHash);
    if (existingDonation) {
      return res.status(409).json({
        success: false,
        message: 'Donation already recorded',
        data: existingDonation
      });
    }

    // Create new donation record
    const newDonation = {
      id: (donations.length + 1).toString(),
      charityId,
      donor,
      amount,
      message: message || '',
      isAnonymous: isAnonymous || false,
      txHash,
      blockNumber,
      gasUsed,
      timestamp: new Date(),
      createdAt: new Date()
    };

    donations.push(newDonation);

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: newDonation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording donation',
      error: error.message
    });
  }
});

// GET /api/donations/charity/:charityId/stats - Get donation statistics for a charity
router.get('/charity/:charityId/stats', (req, res) => {
  try {
    const { charityId } = req.params;
    const charityDonations = donations.filter(d => d.charityId === charityId);

    if (charityDonations.length === 0) {
      return res.json({
        success: true,
        data: {
          totalDonations: 0,
          totalAmount: '0',
          uniqueDonors: 0,
          averageDonation: '0',
          lastDonation: null
        }
      });
    }

    const totalAmount = charityDonations.reduce((sum, donation) => 
      sum + parseFloat(donation.amount), 0
    );

    const uniqueDonors = new Set(
      charityDonations
        .filter(d => !d.isAnonymous)
        .map(d => d.donor.toLowerCase())
    ).size;

    const averageDonation = totalAmount / charityDonations.length;
    const lastDonation = charityDonations.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    )[0];

    res.json({
      success: true,
      data: {
        totalDonations: charityDonations.length,
        totalAmount: totalAmount.toString(),
        uniqueDonors,
        averageDonation: averageDonation.toFixed(6),
        lastDonation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation stats',
      error: error.message
    });
  }
});

// GET /api/donations/donor/:address/stats - Get donation statistics for a donor
router.get('/donor/:address/stats', (req, res) => {
  try {
    const { address } = req.params;
    const donorDonations = donations.filter(
      d => d.donor.toLowerCase() === address.toLowerCase()
    );

    if (donorDonations.length === 0) {
      return res.json({
        success: true,
        data: {
          totalDonations: 0,
          totalAmount: '0',
          charitiesSupported: 0,
          firstDonation: null,
          lastDonation: null
        }
      });
    }

    const totalAmount = donorDonations.reduce((sum, donation) => 
      sum + parseFloat(donation.amount), 0
    );

    const charitiesSupported = new Set(donorDonations.map(d => d.charityId)).size;

    const sortedDonations = donorDonations.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    res.json({
      success: true,
      data: {
        totalDonations: donorDonations.length,
        totalAmount: totalAmount.toString(),
        charitiesSupported,
        firstDonation: sortedDonations[0],
        lastDonation: sortedDonations[sortedDonations.length - 1]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donor stats',
      error: error.message
    });
  }
});

// GET /api/donations/leaderboard - Get top donors (non-anonymous)
router.get('/meta/leaderboard', (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Group donations by donor (excluding anonymous)
    const donorStats = donations
      .filter(d => !d.isAnonymous)
      .reduce((acc, donation) => {
        const donor = donation.donor.toLowerCase();
        if (!acc[donor]) {
          acc[donor] = {
            address: donation.donor,
            totalAmount: 0,
            donationCount: 0,
            charitiesSupported: new Set()
          };
        }
        acc[donor].totalAmount += parseFloat(donation.amount);
        acc[donor].donationCount += 1;
        acc[donor].charitiesSupported.add(donation.charityId);
        return acc;
      }, {});

    // Convert to array and sort by total amount
    const leaderboard = Object.values(donorStats)
      .map(donor => ({
        ...donor,
        charitiesSupported: donor.charitiesSupported.size
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
});

module.exports = router;
